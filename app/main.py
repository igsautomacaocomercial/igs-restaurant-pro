from collections import defaultdict
from datetime import datetime, timedelta
from decimal import Decimal
from enum import Enum
from pathlib import Path
import uuid

from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import func, text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from . import database, models
from .database import init_database, session_scope
from .demo_data import DEMO

BASE_DIR = Path(__file__).resolve().parent.parent
STATIC_DIR = BASE_DIR / "static"

app = FastAPI(title="IGS Restaurant PRO", version="0.1.0")
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

DEMO_DISTRICTS = [
    {"name": "Bethânia", "delivery_fee": 5.00, "estimated_minutes": 35},
    {"name": "Centro", "delivery_fee": 10.00, "estimated_minutes": 25},
    {"name": "Caravelas", "delivery_fee": 7.00, "estimated_minutes": 40},
]

DEMO_CEPS = [
    {"cep": "35164000", "bairro": "Bethânia", "logradouro": "Rua das Flores", "codigo_municipio": "3131307"},
    {"cep": "35160000", "bairro": "Centro", "logradouro": "Avenida Brasil", "codigo_municipio": "3131307"},
    {"cep": "35164200", "bairro": "Caravelas", "logradouro": "Rua Ipê", "codigo_municipio": "3131307"},
]

DEMO_PRODUCT_SEEDS = [
    {"name": "X-Burger Artesanal", "category": "Hamburguer", "sector": "Cozinha", "price": 29.90, "cost": 14.50, "stock": "ok", "track_stock": True},
    {"name": "Pizza Calabresa", "category": "Pizza", "sector": "Cozinha", "price": 54.90, "cost": 24.00, "stock": "ok", "track_stock": True},
    {"name": "Pizza Marguerita", "category": "Pizza", "sector": "Cozinha", "price": 52.90, "cost": 23.00, "stock": "ok", "track_stock": True},
    {"name": "Batata Cheddar", "category": "Porcoes", "sector": "Cozinha", "price": 32.00, "cost": 13.00, "stock": "low", "track_stock": True},
    {"name": "Refrigerante Lata", "category": "Bebidas", "sector": "Bar", "price": 7.00, "cost": 3.00, "stock": "ok", "track_stock": False},
    {"name": "Chopp Pilsen", "category": "Bebidas", "sector": "Bar", "price": 12.00, "cost": 4.50, "stock": "ok", "track_stock": False},
    {"name": "Suco Natural", "category": "Bebidas", "sector": "Copa", "price": 12.00, "cost": 5.00, "stock": "low", "track_stock": False},
    {"name": "Agua Mineral", "category": "Bebidas", "sector": "Copa", "price": 4.00, "cost": 1.00, "stock": "ok", "track_stock": False},
    {"name": "Pedido Delivery", "category": "Delivery", "sector": "Cozinha", "price": 1.00, "cost": 0.50, "stock": "ok", "track_stock": False},
]


class OrderStatus(str, Enum):
    open = "open"
    sent = "sent"
    preparing = "preparing"
    ready = "ready"
    delivering = "delivering"
    closed = "closed"
    cancelled = "cancelled"


def _sync_runtime_mode() -> str:
    mode = "postgres" if database.refresh_database_available() else "demo"
    DEMO["company"]["mode"] = mode
    return mode


def _get_or_create_company(session: Session) -> models.Company:
    company = session.query(models.Company).order_by(models.Company.created_at.asc()).first()
    if company is not None:
        return company

    company = models.Company(
        name=DEMO["company"]["name"],
        document=None,
        phone=None,
        plan=DEMO["company"].get("plan", "PRO"),
    )
    session.add(company)
    session.flush()
    return company


def _elapsed_minutes(value: str) -> int:
    digits = "".join(char for char in value if char.isdigit())
    return int(digits or 0)


def _order_item_product_name(line: str) -> str:
    text = line.casefold()
    if "pizza marguerita" in text or "margherita" in text:
        return "Pizza Marguerita"
    if "pizza calabresa" in text:
        return "Pizza Calabresa"
    if "x-burger" in text:
        return "X-Burger Artesanal"
    if "batata" in text:
        return "Batata Cheddar"
    if "refrigerante" in text:
        return "Refrigerante Lata"
    if "chopp" in text:
        return "Chopp Pilsen"
    if "suco" in text:
        return "Suco Natural"
    if "agua" in text:
        return "Agua Mineral"
    return "Pedido Delivery"


def _seed_demo_dataset(session: Session, company: models.Company) -> None:
    if session.query(models.Product).filter_by(company_id=company.id).first():
        return

    now = datetime.utcnow()

    sectors = {}
    for sector_name in ["Cozinha", "Bar", "Copa"]:
        sector = models.Sector(id=uuid.uuid4(), company_id=company.id, name=sector_name, printer_name=None, printer_type="network")
        session.add(sector)
        sectors[sector_name] = sector

    users = {}
    for role, name in [("garcom", "Ana"), ("cozinha", "Bruno"), ("caixa", "Carol"), ("entregador", "Diego")]:
        user = models.User(id=uuid.uuid4(), company_id=company.id, name=name, email=None, role=role, active=True)
        session.add(user)
        users[name] = user

    categories = {}
    for index, category_name in enumerate(sorted({item["category"] for item in DEMO_PRODUCT_SEEDS}), start=1):
        category = models.ProductCategory(
            id=uuid.uuid4(),
            company_id=company.id,
            code=f"CAT{index:02d}",
            name=category_name,
            group_type=None,
            print_sector=None,
            icon=None,
            notes=None,
            active=True,
            sort_order=index,
        )
        session.add(category)
        categories[category_name] = category

    products = {}
    for product_seed in DEMO_PRODUCT_SEEDS:
        product = models.Product(
            id=uuid.uuid4(),
            company_id=company.id,
            category_id=categories[product_seed["category"]].id,
            sector_id=sectors[product_seed["sector"]].id,
            name=product_seed["name"],
            description=None,
            price=product_seed["price"],
            cost=product_seed["cost"],
            image_url=None,
            active=True,
            track_stock=product_seed["track_stock"],
        )
        session.add(product)
        products[product.name] = product

    session.flush()

    product_lookup = {product.name: product for product in session.query(models.Product).filter_by(company_id=company.id).all()}

    table_by_code = {}
    for index, table_seed in enumerate(DEMO["tables"], start=1):
        waiter = users.get(table_seed["waiter"] or "")
        opened_at = now - timedelta(minutes=int(table_seed["minutes"])) if table_seed["minutes"] else None
        table = models.DiningTable(
            id=uuid.uuid4(),
            company_id=company.id,
            code=table_seed["code"],
            seats=table_seed["seats"],
            status=table_seed["status"],
            waiter_id=waiter.id if waiter else None,
            opened_at=opened_at,
        )
        session.add(table)
        table_by_code[table_seed["code"]] = table

    customer_by_name = {}
    for customer_seed in DEMO["deliveries"]:
        customer = models.Customer(
            id=uuid.uuid4(),
            company_id=company.id,
            delivery_district_id=None,
            name=customer_seed["customer"],
            phone=None,
            cep=None,
            address=customer_seed["address"],
            address_number=None,
            complement=None,
            district=customer_seed["district"],
            city=None,
            state=None,
            notes=None,
        )
        session.add(customer)
        customer_by_name[customer_seed["customer"]] = customer

    session.flush()

    kitchen_table_map = {"M01-148": "01", "D33-219": "04", "M07-174": "05", "Q12-066": "07"}
    for item in DEMO["kitchen"]:
        waiter = users.get(item["waiter"]) if item["waiter"] not in {"Delivery", "QR Mesa"} else None
        channel = "delivery" if item["waiter"] == "Delivery" else ("qr_code" if item["waiter"] == "QR Mesa" else "mesa")
        order = models.Order(
            id=uuid.uuid4(),
            company_id=company.id,
            ticket=item["ticket"],
            table_id=table_by_code[kitchen_table_map.get(item["ticket"])].id if kitchen_table_map.get(item["ticket"]) else None,
            customer_id=None,
            waiter_id=waiter.id if waiter else None,
            channel=channel,
            status=item["status"],
            subtotal=0,
            delivery_fee=0,
            discount=0,
            total=0,
            notes=None,
            created_at=now - timedelta(minutes=_elapsed_minutes(item["elapsed"])),
        )
        session.add(order)
        session.flush()

        total = Decimal("0")
        for line in item["items"]:
            parts = line.split(maxsplit=1)
            quantity = int(parts[0]) if parts and parts[0].isdigit() else 1
            product_name = _order_item_product_name(line if len(parts) == 1 else parts[1])
            product = product_lookup.get(product_name) or next(iter(product_lookup.values()))
            unit_price = Decimal(str(product.price))
            line_total = unit_price * quantity
            total += line_total
            session.add(
                models.OrderItem(
                    id=uuid.uuid4(),
                    order_id=order.id,
                    product_id=product.id,
                    sector_id=product.sector_id,
                    quantity=quantity,
                    unit_price=unit_price,
                    total=line_total,
                    observation=None,
                    status="pending",
                )
            )

        order.subtotal = total
        order.total = total

    delivery_status_map = {
        "pending": "sent",
        "out_for_delivery": "delivering",
        "delivered": "closed",
    }
    for index, delivery_seed in enumerate(DEMO["deliveries"], start=1):
        customer = customer_by_name[delivery_seed["customer"]]
        order = models.Order(
            id=uuid.uuid4(),
            company_id=company.id,
            ticket=f"DLV-{62017 + index}",
            table_id=None,
            customer_id=customer.id,
            waiter_id=users["Diego"].id,
            channel="delivery",
            status=delivery_status_map.get(delivery_seed["status"], "sent"),
            subtotal=Decimal(str(delivery_seed["total"])),
            delivery_fee=Decimal(str(delivery_seed["fee"])),
            discount=0,
            total=Decimal(str(delivery_seed["total"])),
            notes=None,
            created_at=now - timedelta(minutes=22 + index * 4),
        )
        session.add(order)
        session.flush()
        product = product_lookup["Pedido Delivery"]
        session.add(
            models.OrderItem(
                id=uuid.uuid4(),
                order_id=order.id,
                product_id=product.id,
                sector_id=product.sector_id,
                quantity=1,
                unit_price=Decimal(str(delivery_seed["total"])),
                total=Decimal(str(delivery_seed["total"])),
                observation=None,
                status="pending",
            )
        )
        session.add(
            models.Delivery(
                id=uuid.uuid4(),
                order_id=order.id,
                courier_id=None if delivery_seed["courier"] == "Livre" else users["Diego"].id,
                district=delivery_seed["district"],
                fee=Decimal(str(delivery_seed["fee"])),
                commission=Decimal("0"),
                status=delivery_seed["status"],
                estimated_at=now + timedelta(minutes=35),
                delivered_at=now if delivery_seed["status"] == "delivered" else None,
            )
        )

    for finance_seed in DEMO["finance"]:
        entry_status = finance_seed["status"]
        if finance_seed["type"] == "receivable":
            due_date = (now - timedelta(days=1)).date()
        else:
            due_date = (now + timedelta(days=3)).date()
        session.add(
            models.FinancialEntry(
                id=uuid.uuid4(),
                company_id=company.id,
                type=finance_seed["type"],
                account_plan="Geral",
                description=finance_seed["description"],
                amount=Decimal(str(finance_seed["amount"])),
                due_date=due_date,
                paid_at=now.date() if entry_status == "paid" else None,
                status=entry_status,
            )
        )

    session.flush()


def _ensure_legacy_schema_compatibility(session: Session) -> None:
    session.execute(text("ALTER TABLE orders ADD COLUMN IF NOT EXISTS ticket TEXT"))
    session.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_ticket ON orders(ticket)"))


def _seed_reference_data(session: Session, company: models.Company) -> None:
    if not session.query(models.DeliveryDistrict).filter_by(company_id=company.id).count():
        session.add_all(
            [
                models.DeliveryDistrict(
                    company_id=company.id,
                    name=item["name"],
                    delivery_fee=item["delivery_fee"],
                    estimated_minutes=item["estimated_minutes"],
                    active=True,
                )
                for item in DEMO_DISTRICTS
            ]
        )

    if not session.query(models.Cep).count():
        session.add_all([models.Cep(**item) for item in DEMO_CEPS])

    _seed_demo_dataset(session, company)


def _format_elapsed(created_at: datetime | None) -> str:
    if not created_at:
        return "00 min"
    elapsed = max(int((datetime.utcnow() - created_at.replace(tzinfo=None)).total_seconds() // 60), 0)
    return f"{elapsed:02d} min"


def _build_dashboard_from_database(session: Session, company: models.Company) -> dict:
    users = {user.id: user.name for user in session.query(models.User).filter_by(company_id=company.id).all()}
    products = {product.id: product for product in session.query(models.Product).filter_by(company_id=company.id).all()}
    product_categories = {category.id: category.name for category in session.query(models.ProductCategory).filter_by(company_id=company.id).all()}
    sectors = {sector.id: sector.name for sector in session.query(models.Sector).filter_by(company_id=company.id).all()}
    tables = session.query(models.DiningTable).filter_by(company_id=company.id).order_by(models.DiningTable.code).all()
    orders = session.query(models.Order).filter_by(company_id=company.id).order_by(models.Order.created_at.asc()).all()
    deliveries = (
        session.query(models.Delivery, models.Order, models.Customer)
        .join(models.Order, models.Delivery.order_id == models.Order.id)
        .outerjoin(models.Customer, models.Order.customer_id == models.Customer.id)
        .filter(models.Order.company_id == company.id)
        .order_by(models.Order.created_at.asc())
        .all()
    )
    finance_entries = session.query(models.FinancialEntry).filter_by(company_id=company.id).order_by(models.FinancialEntry.due_date.asc()).all()
    order_items = session.query(models.OrderItem).join(models.Order, models.OrderItem.order_id == models.Order.id).filter(models.Order.company_id == company.id).all()

    items_by_order = defaultdict(list)
    for item in order_items:
        items_by_order[item.order_id].append(item)

    table_totals = defaultdict(float)
    for order in orders:
        if order.table_id and order.status != "cancelled":
            table_totals[order.table_id] += float(order.total or 0)

    order_total_sum = sum(float(order.total or 0) for order in orders)
    open_tables = sum(1 for table in tables if table.status in {"occupied", "reserved", "closing"})
    delivery_pending = sum(1 for delivery, _, _ in deliveries if delivery.status == "pending")
    stock_alerts = DEMO["summary"]["stock_alerts"]

    summary = {
        "revenue": round(order_total_sum, 2),
        "orders": len(orders),
        "average_ticket": round(order_total_sum / len(orders), 2) if orders else 0,
        "open_tables": open_tables,
        "delivery_pending": delivery_pending,
        "stock_alerts": stock_alerts,
    }

    now = datetime.utcnow()
    chart = []
    for offset in range(6, -1, -1):
        day = (now - timedelta(days=offset)).date()
        day_total = sum(float(order.total or 0) for order in orders if order.created_at and order.created_at.date() == day)
        chart.append({"label": day.strftime("%d/%m"), "value": round(day_total, 2)})

    table_rows = []
    for table in tables:
        table_rows.append(
            {
                "code": table.code,
                "seats": table.seats,
                "status": table.status,
                "waiter": users.get(table.waiter_id),
                "total": round(table_totals.get(table.id, 0.0), 2),
                "minutes": max(int((datetime.utcnow() - table.opened_at.replace(tzinfo=None)).total_seconds() // 60), 0) if table.opened_at else 0,
            }
        )

    if not table_rows:
        table_rows = DEMO["tables"]

    product_rows = []
    for product in products.values():
        product_rows.append(
            {
                "name": product.name,
                "category": product_categories.get(product.category_id) or "Geral",
                "price": float(product.price),
                "sector": sectors.get(product.sector_id) or "Cozinha",
                "stock": "low" if product.track_stock else "ok",
            }
        )

    if not product_rows:
        product_rows = DEMO["products"]

    kitchen_rows = []
    for order in orders:
        if order.status not in {"sent", "preparing", "ready"}:
            continue
        items = []
        for item in items_by_order.get(order.id, []):
            product = products.get(item.product_id)
            if product:
                quantity = int(item.quantity)
                items.append(f"{quantity} {product.name}")
        if not items:
            items = ["Pedido sem itens"]
        first_item = items_by_order.get(order.id, [None])[0]
        sector_name = "Cozinha"
        if first_item and first_item.sector_id:
            sector_name = sectors.get(first_item.sector_id, "Cozinha")
        waiter_name = users.get(order.waiter_id) or ("QR Mesa" if order.channel == "qr_code" else "Delivery")
        kitchen_rows.append(
            {
                "ticket": order.ticket,
                "sector": sector_name,
                "status": order.status,
                "items": items,
                "waiter": waiter_name,
                "elapsed": _format_elapsed(order.created_at),
            }
        )

    if not kitchen_rows:
        kitchen_rows = DEMO["kitchen"]

    delivery_rows = []
    for delivery, order, customer in deliveries:
        customer_name = customer.name if customer else "Cliente"
        courier_name = users.get(delivery.courier_id) or "Livre"
        eta = "Finalizado" if delivery.status == "delivered" else f"{35 if delivery.district != 'Centro' else 25} min"
        delivery_rows.append(
            {
                "customer": customer_name,
                "district": delivery.district or "Centro",
                "status": delivery.status,
                "courier": courier_name,
                "total": float(order.total or 0),
                "eta": eta,
            }
        )

    if not delivery_rows:
        delivery_rows = DEMO["deliveries"]

    finance_rows = [
        {
            "type": entry.type,
            "description": entry.description,
            "amount": float(entry.amount),
            "status": entry.status,
        }
        for entry in finance_entries
    ]
    if not finance_rows:
        finance_rows = DEMO["finance"]

    return {
        "company": {"name": DEMO["company"]["name"], "plan": DEMO["company"].get("plan", "PRO"), "mode": "postgres"},
        "summary": summary,
        "tables": table_rows,
        "products": product_rows,
        "kitchen": kitchen_rows,
        "deliveries": delivery_rows,
        "finance": finance_rows,
        "chart": chart,
    }


@app.on_event("startup")
def startup() -> None:
    if init_database():
        try:
            with session_scope() as session:
                company = _get_or_create_company(session)
                _ensure_legacy_schema_compatibility(session)
                _seed_reference_data(session, company)
        except SQLAlchemyError:
            DEMO["company"]["mode"] = "demo"
            database.database_available = False
        else:
            DEMO["company"]["mode"] = "postgres"
    else:
        DEMO["company"]["mode"] = "demo"


@app.get("/", response_class=HTMLResponse)
def index() -> str:
    with open(STATIC_DIR / "index.html", "r", encoding="utf-8") as page:
        return page.read()


@app.get("/api/health")
def health() -> dict:
    mode = _sync_runtime_mode()
    return {
        "app": "IGS Restaurant PRO",
        "database": mode,
        "database_reachable": mode == "postgres",
    }


@app.get("/api/dashboard")
def dashboard() -> dict:
    mode = _sync_runtime_mode()
    if mode != "postgres":
        return DEMO

    with session_scope() as session:
        company = _get_or_create_company(session)
        _ensure_legacy_schema_compatibility(session)
        _seed_reference_data(session, company)
        return _build_dashboard_from_database(session, company)


@app.get("/api/ceps/{cep}")
def get_cep(cep: str) -> dict:
    clean_cep = "".join(char for char in cep if char.isdigit())
    if len(clean_cep) != 8:
        raise HTTPException(status_code=400, detail="CEP deve conter 8 digitos")

    if _sync_runtime_mode() == "postgres":
        with session_scope() as session:
            company = _get_or_create_company(session)
            _ensure_legacy_schema_compatibility(session)
            _seed_reference_data(session, company)
            row = session.get(models.Cep, clean_cep)
            if row:
                return {
                    "cep": row.cep,
                    "bairro": row.bairro,
                    "logradouro": row.logradouro,
                    "codigo_municipio": row.codigo_municipio,
                }

    demo_ceps = {item["cep"]: item for item in DEMO_CEPS}
    if clean_cep in demo_ceps:
        return demo_ceps[clean_cep]

    raise HTTPException(status_code=404, detail="CEP nao encontrado")


@app.get("/api/delivery-districts")
def list_delivery_districts() -> list[dict]:
    if _sync_runtime_mode() == "postgres":
        with session_scope() as session:
            company = _get_or_create_company(session)
            _ensure_legacy_schema_compatibility(session)
            _seed_reference_data(session, company)
            rows = (
                session.query(models.DeliveryDistrict)
                .filter_by(company_id=company.id, active=True)
                .order_by(models.DeliveryDistrict.name)
                .all()
            )
            if rows:
                return [
                    {
                        "id": str(row.id),
                        "name": row.name,
                        "delivery_fee": float(row.delivery_fee),
                        "estimated_minutes": row.estimated_minutes,
                    }
                    for row in rows
                ]
    return DEMO_DISTRICTS


@app.get("/api/delivery/quote")
def delivery_quote(
    district: str = Query(..., min_length=2),
    order_total: Decimal = Query(..., ge=Decimal("0")),
) -> dict:
    district_normalized = district.strip().casefold()
    districts = list_delivery_districts()
    selected = next((item for item in districts if item["name"].casefold() == district_normalized), None)
    if not selected:
        raise HTTPException(status_code=404, detail="Bairro de entrega nao cadastrado")

    delivery_fee = Decimal(str(selected["delivery_fee"]))
    return {
        "district": selected["name"],
        "order_total": float(order_total),
        "delivery_fee": float(delivery_fee),
        "total": float(order_total + delivery_fee),
        "estimated_minutes": selected["estimated_minutes"],
    }


@app.post("/api/orders/{ticket}/status/{status}")
def update_order_status(ticket: str, status: OrderStatus) -> dict:
    if _sync_runtime_mode() == "postgres":
        with session_scope() as session:
            company = _get_or_create_company(session)
            _ensure_legacy_schema_compatibility(session)
            _seed_reference_data(session, company)
            order = session.query(models.Order).filter_by(company_id=company.id, ticket=ticket).one_or_none()
            if not order:
                raise HTTPException(status_code=404, detail="Pedido nao encontrado")

            order.status = status.value
            if status in {OrderStatus.closed, OrderStatus.cancelled}:
                order.closed_at = datetime.utcnow()
            session.flush()

            item_rows = session.query(models.OrderItem).filter_by(order_id=order.id).all()
            products = {product.id: product for product in session.query(models.Product).filter_by(company_id=company.id).all()}
            items = []
            for item in item_rows:
                product = products.get(item.product_id)
                quantity = int(item.quantity)
                items.append(f"{quantity} {product.name if product else 'Item'}")

            return {
                "ok": True,
                "order": {
                    "ticket": order.ticket,
                    "status": order.status,
                    "channel": order.channel,
                    "items": items,
                },
            }

    for item in DEMO["kitchen"]:
        if item["ticket"] == ticket:
            item["status"] = status.value
            return {"ok": True, "order": item}

    raise HTTPException(status_code=404, detail="Pedido nao encontrado")
