from sqlalchemy import create_engine # DB 연결 생성
from sqlalchemy.orm import sessionmaker, DeclarativeBase 
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str = "postgresql://postgres:postgres@localhost:5432/keyboard_builder"
    secret_key: str = "dev-secret-key-change-in-production"

    class Config:
        env_file = ".env" # .env 파일에서 환경변수 읽기

class Base(DeclarativeBase):
    pass

# 환경변수 로드
settings = Settings()

# DB engine 생성
engine = create_engine(
    settings.database_url,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
    pool_recycle=1800,
)

# 세션 생성
# 수동 commit, 수동 flush = 내가 직접 컨트롤 하는 것으로 더 안전하고 동작 예측 가능해짐
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal() # 세션 열기
    try:
        yield db # API에서 사용
    finally:
        db.close() # request 끝나면 세션 닫기

    
'''
- 목적
- PostgreSQL DB 연결 설정
- SQLAlchemy 세션 관리
'''