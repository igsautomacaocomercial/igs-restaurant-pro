from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles

from . import database, models
from .database import init_database, session_scope
from .demo_data import DEMO

app = FastAPI(title="IGS Restaurant PRO", version="0.1.0")
app.mount("/static", StaticFiles(directory="static"), name="static")

DEMO_DISTRICTS = [
    {"name": "Bethânia", "delivery_fee": 5.00, "estimated_minutes": 35},
    {"name": "Centro", "delivery_fee": 10.00, "estimated_minutes": 25},
    {"name": "Caravelas", "delivery_fee": 7.00, "estimated_minutes": 40},
]


@app.on_event("startup")
def startup() -> None:
    DEMO["company"]["mode"] = "postgres" if init_database() else "demo"


@app.get("/", response_class=HTMLResponse)
def index() -> str:
    with open("static/index.html", "r", encoding="utf-8") as page:
        return page.read()


@app.get("/api/health")
def health() -> dict:
    return {"app": "IGS Restaurant PRO", "database": DEMO["company"]["mode"]}


@app.get("/api/dashboard")
def dashboard() -> dict:
    return DEMO


@app.get("/api/ceps/{cep}")
def get_cep(cep: str) -> dict:
    clean_cep = "".join(char for char in cep if char.isdigit())
    if len(clean_cep) != 8:
        raise HTTPException(status_code=400, detail="CEP deve conter 8 digitos")

    if database.database_available:
        with session_scope() as session:
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
    if database.database_available:
        with session_scope() as session:
            rows = session.query(models.DeliveryDistrict).filter_by(active=True).order_by(models.DeliveryDistrict.name).all()
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
    order_total: float = Query(..., ge=0),
) -> dict:
    district_normalized = district.strip().casefold()
    districts = list_delivery_districts()
    selected = next((item for item in districts if item["name"].casefold() == district_normalized), None)
    if not selected:
        raise HTTPException(status_code=404, detail="Bairro de entrega nao cadastrado")

    delivery_fee = float(selected["delivery_fee"])
    return {
        "district": selected["name"],
        "order_total": order_total,
        "delivery_fee": delivery_fee,
        "total": order_total + delivery_fee,
        "estimated_minutes": selected["estimated_minutes"],
    }


@app.post("/api/orders/{ticket}/status/{status}")
def update_order_status(ticket: str, status: str) -> dict:
    for item in DEMO["kitchen"]:
        if item["ticket"] == ticket:
            item["status"] = status
            return {"ok": True, "order": item}
    return {"ok": False, "message": "Pedido nao encontrado"}
