from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.models import PCB, Case, Plate, Stabilizer, Switch, Keycap
from app.routers import parts_router

# 서버 시작 시 테이블 생성
Base.metadata.create_all(bind=engine)

# FastAPI APP 생성
app = FastAPI(
    title="Keyboard Builder API",
    description="커스텀 키보드 호환성 검증 API",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Next.js 주소
    allow_credentials=True, # 쿠키/인증 허용
    allow_methods=["*"], # 모든 HTTP method 허용
    allow_headers=["*"], # 모든 header 허용
)

app.include_router(parts_router)

@app.get("/")
def root():
    return {
        "message": "Keyboard Builder API"
    }

'''
왜 CORS를 사용하는데?
- 다른 사이트가 브라우저에서 몰래 다른 서버로 요청 보내는 걸 막기 위해 사용
- CORS 사용 시 허용된 도메인만 내 API를 호출할 수 있음
- 다만, 브라우저에서만 동작함 (다른 서버에서 직접 내 API에 접근하는 건 못 막음) --> API key, JWT 인증 등 이런거로 막음
'''

'''
- 목적
- FastAPI APP 생성
- Router 연결
- CORS 설정
'''