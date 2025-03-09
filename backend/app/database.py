from sqlmodel import SQLModel, create_engine
from redis import Redis
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://admin:password@localhost/finance_db")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

engine = create_engine(DATABASE_URL)
redis_client = Redis.from_url(REDIS_URL)

def init_db():
    SQLModel.metadata.create_all(engine) 