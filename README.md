# KeyboardBuilder

## 📌 Overview
커스텀 키보드 부품 간 호환성을 자동으로 검증하는 웹 플랫폼입니다.
PCB, Case, Plate, Stabilizer, Switch, Keycap 6가지 부품을 선택하면 실시간으로 호환성을 검사해줍니다.

---

## 🎯 Project Goals
- 커스텀 키보드 입문자의 부품 선택 실수 방지
- 실시간 호환성 검증으로 빠른 피드백 제공
- 깔끔한 UI로 부품 비교 및 선택 편의성 향상

---

## 🧩 Tech Stack

**Frontend**

![Next.js](https://img.shields.io/badge/Next.js_14-000000?style=flat&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/shadcn/ui-000000?style=flat&logo=shadcnui&logoColor=white)

**Backend**

![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-D71F00?style=flat&logo=sqlalchemy&logoColor=white)

**Infrastructure**

![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)

---

## ⚡ Features

| Feature | Description |
|---------|-------------|
| 부품 목록 | 6가지 카테고리별 부품 조회 |
| 부품 선택 | 클릭으로 부품 선택/해제 |
| 호환성 검증 | 선택한 부품 간 실시간 호환성 체크 |
| 호환성 규칙 | Layout, Mounting Type, Switch Type 등 검사 |

---

## 🔧 Compatibility Rules

```
PCB ↔ Case      : Layout, Mounting Type 일치
PCB ↔ Plate     : Layout 일치
PCB ↔ Switch    : Switch Type 일치
Plate ↔ Switch  : Switch Type 일치
Switch ↔ Keycap : Stem Type 일치
```

---

## 📁 Structure

```
keyboard-builder/
├── backend/
│   └── app/
│       ├── models/        # SQLAlchemy 모델
│       ├── schemas/       # Pydantic 스키마
│       ├── routers/       # API 라우터
│       ├── services/      # 비즈니스 로직
│       ├── database.py    # DB 설정
│       ├── main.py        # FastAPI 앱
│       └── seed.py        # 시드 데이터
├── frontend/
│   ├── app/
│   │   ├── page.tsx       # 랜딩 페이지
│   │   └── builder/
│   │       └── page.tsx   # 빌더 페이지
│   ├── components/ui/     # shadcn/ui 컴포넌트
│   └── lib/
│       ├── types.ts       # TypeScript 타입
│       └── api.ts         # API 클라이언트
└── README.md
```

---

## 🚀 Run

### Prerequisites
- Python 3.9+
- Node.js 18+
- Docker (PostgreSQL용)

### Database
```bash
docker run -d --name keyboard-db -p 5432:5432 \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=keyboard_builder \
  postgres:15
```

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python -m app.seed  # 시드 데이터
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🌐 Access

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Builder | http://localhost:3000/builder |
| API Docs | http://localhost:8000/docs |

---

## 📸 Screenshots

> 추후 추가 예정

---

## 🛣️ Roadmap

- [ ] 사용자 로그인/회원가입
- [ ] 빌드 저장/불러오기
- [ ] 더 많은 부품 데이터
- [ ] 3D 미리보기
- [ ] 가격 비교
- [ ] 배포 (Vercel + Railway)

---

## 📝 License

MIT License
