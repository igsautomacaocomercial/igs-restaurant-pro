from decimal import Decimal
from enum import Enum
from pathlib import Path

from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
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


def _seed_reference_data(session: Session, company: models.Company) -> None:
    seeded = False

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
        seeded = True

    if not session.query(models.Cep).count():
        session.add_all([models.Cep(**item) for item in DEMO_CEPS])
        seeded = True

    if seeded:
        session.flush()


@app.on_event("startup")
def startup() -> None:
    if init_database():
        try:
            with session_scope() as session:
                company = _get_or_create_company(session)
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
    _sync_runtime_mode()
    return DEMO


@app.get("/api/ceps/{cep}")
def get_cep(cep: str) -> dict:
    clean_cep = "".join(char for char in cep if char.isdigit())
    if len(clean_cep) != 8:
        raise HTTPException(status_code=400, detail="CEP deve conter 8 digitos")

    if _sync_runtime_mode() == "postgres":
        with session_scope() as session:
            company = _get_or_create_company(session)
            _seed_reference_data(session, company)
            row = session.get(models.Cep, clean_cep)
            if row:
                return {
                    "cep": row.cep,
                    "bairro": row.bairro,
                    "logradouro": row.logradouro,
                    "codigo_municipio": row.codigo_municipio,
                }

    demo_ceps = {
        "35164000": {"cep": "35164000", "bairro": "Bethânia", "logradouro": "Rua das Flores", "codigo_municipio": "3131307"},
        "35160000": {"cep": "35160000", "bairro": "Centro", "logradouro": "Avenida Brasil", "codigo_municipio": "3131307"},
        "35164200": {"cep": "35164200", "bairro": "Caravelas", "logradouro": "Rua Ipê", "codigo_municipio": "3131307"},
    }
    if clean_cep in demo_ceps:
        return demo_ceps[clean_cep]

    raise HTTPException(status_code=404, detail="CEP nao encontrado")


@app.get("/api/delivery-districts")
def list_delivery_districts() -> list[dict]:
    if _sync_runtime_mode() == "postgres":
        with session_scope() as session:
            company = _get_or_create_company(session)
            _seed_reference_data(session, company)
            rows = (
                session.query(models.DeliveryDistrict)
                .filter_by(company_id=company.id, active=True)
                .order_by(models.DeliveryDistrict.name)
                .all()
            )
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
    for item in DEMO["kitchen"]:
        if item["ticket"] == ticket:
            item["status"] = status.value
            return {"ok": True, "order": item}

    raise HTTPException(status_code=404, detail="Pedido nao encontrado")
