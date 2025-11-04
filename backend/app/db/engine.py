from sqlmodel import SQLModel, create_engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "sqlite:///./hr.db"
engine = create_engine(DATABASE_URL, echo=False, future=True)

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

def get_session():
    with SessionLocal() as session:
        yield session

# ← THIS LINE WAS MISSING
def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
