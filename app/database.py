import os
from contextlib import contextmanager

from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session, declarative_base, sessionmaker

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg://postgres:123@localhost:5432/igs_restaurant_pro",
)

Base = declarative_base()
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

database_available = False


def refresh_database_available() -> bool:
    global database_available
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
    except SQLAlchemyError:
        database_available = False
    else:
        database_available = True
    return database_available


def init_database() -> bool:
    global database_available
    if not refresh_database_available():
        return False

    try:
        Base.metadata.create_all(bind=engine)
    except SQLAlchemyError:
        database_available = False
        return False

    return refresh_database_available()


@contextmanager
def session_scope():
    session: Session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()
