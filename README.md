# IGS Restaurant PRO

Sistema de gestão para restaurantes, bares, lanchonetes, pizzarias, trailers, cafeterias e delivery.

## Tecnologias

- Python + FastAPI
- PostgreSQL
- HTML5, CSS3 e JavaScript
- Interface responsiva para computador, tablet e celular

## Banco PostgreSQL

Configuração padrão:

```env
DATABASE_URL=postgresql+psycopg://postgres:123@localhost:5432/igs_restaurant_pro
```

Para subir o banco com Docker:

```bash
docker compose up -d db
```

## Rodar o sistema

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Acesse:

```text
http://127.0.0.1:8000
```

Se o PostgreSQL ainda não estiver ativo, o sistema abre em modo demonstração com dados em memória.

