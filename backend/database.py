from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text, create_engine
from sqlalchemy.orm import declarative_base, relationship, sessionmaker

DATABASE_URL = "sqlite:///./bot_hosting.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)
    bots = relationship("Bot", back_populates="owner", cascade="all, delete")


class Bot(Base):
    __tablename__ = "bots"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    source_code = Column(Text, nullable=False)
    is_running = Column(Boolean, default=False, nullable=False)
    container_id = Column(String(128), nullable=True)

    owner = relationship("User", back_populates="bots")


def init_db() -> None:
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
