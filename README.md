# KeyboardBuilder

## Overview
커스텀 키보드 부품 간 호환성을 자동으로 검증하는 웹 플랫폼입니다.

PCB, Case, Plate, Stabilizer, Switch, Keycap 6가지 부품을 선택하면 실시간으로 호환성을 검사하고, 3D 미리보기로 조합 결과를 확인할 수 있습니다.

---

## Project Goals
- 커스텀 키보드 입문자의 부품 선택 실수 방지
- 실시간 호환성 검증으로 빠른 피드백 제공
- 3D 시각화로 완성 키보드 미리보기
- 사용자 인증을 통한 개인화 기반 마련

---

## Tech Stack

**Frontend**

![Next.js](https://img.shields.io/badge/Next.js_14-000000?style=flat&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/shadcn/ui-000000?style=flat&logo=shadcnui&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-000000?style=flat&logo=three.js&logoColor=white)

**Backend**

![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-D71F00?style=flat&logo=sqlalchemy&logoColor=white)

**Auth**

![JWT](https://img.shields.io/badge/JWT-000000?style=flat&logo=jsonwebtokens&logoColor=white)
![bcrypt](https://img.shields.io/badge/bcrypt-003A70?style=flat)

**Infrastructure**

![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)

---

## Features

| Feature | Description |
|---------|-------------|
| 부품 목록 | 6가지 카테고리별 부품 조회 |
| 부품 선택 | 클릭으로 부품 선택/해제 |
| 호환성 검증 | 선택한 부품 간 실시간 호환성 체크 |
| 3D 미리보기 | Three.js 기반 키보드 조합 시각화 |
| 가격 계산 | 레이아웃별 스위치 수량 반영한 총 가격 계산 |
| 회원가입/로그인 | JWT 기반 이메일 인증 시스템 |
| 다크 모드 | 시스템 설정 연동 + 수동 전환 |

---

## Compatibility Rules

6가지 부품 간 호환성 검사 규칙:

```
PCB ↔ Case      : Layout + Mounting Type 일치
PCB ↔ Plate     : Layout 일치
PCB ↔ Switch    : Switch Type 일치
Plate ↔ Case    : Layout 일치
Plate ↔ Switch  : Switch Type 일치
Switch ↔ Keycap : Stem Type 일치
```

검증은 클라이언트(즉시 피드백)와 서버(API) 양쪽에서 수행됩니다.

---

## Structure

```
keyboard-builder/
├── backend/
│   └── app/
│       ├── models/
│       │   ├── parts.py       # 부품 모델 (PCB, Case, Plate, Switch, Stabilizer, Keycap)
│       │   └── user.py        # 사용자 모델
│       ├── schemas/
│       │   ├── parts.py       # 부품 스키마
│       │   └── auth.py        # 인증 스키마
│       ├── routers/
│       │   ├── parts.py       # 부품 API (/api/parts)
│       │   └── auth.py        # 인증 API (/api/auth)
│       ├── services/
│       │   └── compatibility.py  # 호환성 검증 로직
│       ├── auth.py            # JWT + bcrypt 유틸리티
│       ├── database.py        # DB 설정
│       ├── main.py            # FastAPI 앱
│       └── seed.py            # 시드 데이터
├── frontend/
│   ├── app/
│   │   ├── page.tsx           # 랜딩 페이지
│   │   ├── login/
│   │   │   └── page.tsx       # 로그인/회원가입 페이지
│   │   └── builder/
│   │       └── page.tsx       # 빌더 페이지
│   ├── components/
│   │   ├── keyboard-3d.tsx    # 3D 키보드 시각화
│   │   └── ui/                # shadcn/ui 컴포넌트
│   └── lib/
│       ├── types.ts           # TypeScript 타입
│       ├── api.ts             # API 클라이언트
│       ├── hooks.ts           # React Query 훅
│       ├── auth-context.tsx   # 인증 상태 관리
│       └── compatibility.ts   # 클라이언트 호환성 검증
└── README.md
```

---

## API Endpoints

### Parts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/parts/all` | 전체 부품 목록 조회 |
| GET | `/api/parts/{category}` | 카테고리별 부품 조회 |
| GET | `/api/parts/{category}/{id}` | 개별 부품 조회 |
| POST | `/api/parts/compatibility/check` | 호환성 검사 |

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | 회원가입 (이메일, 비밀번호, 닉네임) |
| POST | `/api/auth/login` | 로그인 (JWT 토큰 반환) |
| GET | `/api/auth/me` | 현재 사용자 정보 (토큰 필요) |

---

## Run

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

## Access

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Builder | http://localhost:3000/builder |
| Login | http://localhost:3000/login |
| API Docs | http://localhost:8000/docs |

---

## Screenshots

> 추후 추가 예정

---

## Roadmap

- [x] 부품 목록 및 선택
- [x] 호환성 검증 (서버 + 클라이언트)
- [x] 3D 미리보기
- [x] 가격 계산
- [x] 다크 모드
- [x] 사용자 로그인/회원가입
- [ ] 빌드 저장/불러오기
- [ ] 더 많은 부품 데이터
- [ ] 배포 (Vercel + Railway)

---

## License

MIT License
