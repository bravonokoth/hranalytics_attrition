from sqlmodel import create_engine, SQLModel

# SQLite file lives one level up so Git never sees it
engine = create_engine("sqlite:///../hranalytics.db", echo=False)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)