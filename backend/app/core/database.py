import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from dotenv import load_dotenv
from app.core.config import settings
load_dotenv()

DATABASE_URL = settings.DATABASE_URL

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# THIS IS THE MISSING DEPENDENCY FUNCTION:
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()