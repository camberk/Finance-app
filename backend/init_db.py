from app.db.session import Base, engine
import app.models  # Import all models to ensure they're registered with the Base metadata

def init_db():
    # Create all tables in the database
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully")

if __name__ == "__main__":
    init_db() 