from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from app.core.config import DATABASE_URL, SYNC_DATABASE_URL
from app.storage.models import Base

sync_engine = create_engine(SYNC_DATABASE_URL, connect_args={"check_same_thread": False})
SyncSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=sync_engine)

async_engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(async_engine, class_=AsyncSession, expire_on_commit=False)


def init_db():
    Base.metadata.create_all(bind=sync_engine)


async def get_async_db():
    async with AsyncSessionLocal() as session:
        yield session


def get_sync_db():
    db = SyncSessionLocal()
    try:
        yield db
    finally:
        db.close()
