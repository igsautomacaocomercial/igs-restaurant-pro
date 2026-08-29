from datetime import datetime, timedelta


DEMO = {
    "company": {"name": "IGS Burger House", "plan": "PRO", "mode": "demo"},
    "summary": {
        "revenue": 4820.75,
        "orders": 86,
        "average_ticket": 56.05,
        "open_tables": 14,
        "delivery_pending": 7,
        "stock_alerts": 5,
    },
    "tables": [
        {"code": "01", "seats": 4, "status": "occupied", "waiter": "Ana", "total": 148.5, "minutes": 42},
        {"code": "02", "seats": 2, "status": "free", "waiter": None, "total": 0, "minutes": 0},
        {"code": "03", "seats": 6, "status": "reserved", "waiter": "Bruno", "total": 0, "minutes": 0},
        {"code": "04", "seats": 4, "status": "closing", "waiter": "Carol", "total": 212.9, "minutes": 78},
        {"code": "05", "seats": 4, "status": "occupied", "waiter": "Ana", "total": 89.7, "minutes": 25},
        {"code": "06", "seats": 8, "status": "free", "waiter": None, "total": 0, "minutes": 0},
        {"code": "07", "seats": 4, "status": "occupied", "waiter": "Diego", "total": 174.0, "minutes": 63},
        {"code": "08", "seats": 2, "status": "free", "waiter": None, "total": 0, "minutes": 0},
    ],
    "products": [
        {"name": "X-Burger Artesanal", "category": "Hamburguer", "price": 29.9, "sector": "Cozinha", "stock": "ok"},
        {"name": "Pizza Calabresa", "category": "Pizza", "price": 54.9, "sector": "Cozinha", "stock": "ok"},
        {"name": "Batata Cheddar", "category": "Porcoes", "price": 32.0, "sector": "Cozinha", "stock": "low"},
        {"name": "Refrigerante Lata", "category": "Bebidas", "price": 7.0, "sector": "Bar", "stock": "ok"},
        {"name": "Suco Natural", "category": "Bebidas", "price": 12.0, "sector": "Copa", "stock": "low"},
    ],
    "kitchen": [
        {"ticket": "M01-148", "sector": "Cozinha", "status": "sent", "items": ["2 X-Burger", "1 Batata Cheddar"], "waiter": "Ana", "elapsed": "08 min"},
        {"ticket": "D33-219", "sector": "Cozinha", "status": "preparing", "items": ["1 Pizza Calabresa", "1 Pizza Marguerita"], "waiter": "Delivery", "elapsed": "17 min"},
        {"ticket": "M07-174", "sector": "Bar", "status": "ready", "items": ["3 Refrigerante", "2 Chopp"], "waiter": "Diego", "elapsed": "04 min"},
        {"ticket": "Q12-066", "sector": "Copa", "status": "sent", "items": ["2 Suco Natural"], "waiter": "QR Mesa", "elapsed": "03 min"},
    ],
    "deliveries": [
        {"customer": "Mariana Lopes", "district": "Centro", "status": "pending", "courier": "Livre", "total": 86.8, "eta": "35 min"},
        {"customer": "Carlos Lima", "district": "Jardim Europa", "status": "out_for_delivery", "courier": "Rafa", "total": 124.5, "eta": "12 min"},
        {"customer": "Patricia Souza", "district": "Vila Nova", "status": "delivered", "courier": "Nina", "total": 58.0, "eta": "Finalizado"},
    ],
    "finance": [
        {"type": "receivable", "description": "PIX delivery", "amount": 620.0, "status": "paid"},
        {"type": "receivable", "description": "Cartao credito", "amount": 1880.2, "status": "pending"},
        {"type": "payable", "description": "Fornecedor bebidas", "amount": 740.0, "status": "open"},
        {"type": "payable", "description": "Energia", "amount": 510.9, "status": "overdue"},
    ],
    "chart": [
        {"label": (datetime.now() - timedelta(days=6)).strftime("%d/%m"), "value": 2480},
        {"label": (datetime.now() - timedelta(days=5)).strftime("%d/%m"), "value": 3120},
        {"label": (datetime.now() - timedelta(days=4)).strftime("%d/%m"), "value": 2890},
        {"label": (datetime.now() - timedelta(days=3)).strftime("%d/%m"), "value": 3560},
        {"label": (datetime.now() - timedelta(days=2)).strftime("%d/%m"), "value": 4210},
        {"label": (datetime.now() - timedelta(days=1)).strftime("%d/%m"), "value": 3980},
        {"label": datetime.now().strftime("%d/%m"), "value": 4820},
    ],
}

