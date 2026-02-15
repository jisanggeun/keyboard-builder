# KeyboardBuilder

## Overview
커스텀 키보드 부품 간 호환성을 자동으로 검증하는 웹 플랫폼입니다.

PCB, Case, Plate, Stabilizer, Switch, Keycap 6가지 부품을 선택하면 실시간으로 호환성을 검사하고, 3D 미리보기로 조합 결과를 확인할 수 있습니다. 빌드를 저장하고 커뮤니티에서 공유할 수 있습니다.

---

## Tech Stack

**Frontend**

![Next.js](https://img.shields.io/badge/Next.js_14-000000?style=flat&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/shadcn/ui-000000?style=flat&logo=shadcnui&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-000000?style=flat&logo=three.js&logoColor=white)
![TanStack Query](https://img.shields.io/badge/TanStack_Query-FF4154?style=flat&logo=reactquery&logoColor=white)

**Backend**

![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-D71F00?style=flat&logo=sqlalchemy&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=flat&logo=jsonwebtokens&logoColor=white)

**Infrastructure**

![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)
![Cloudflare R2](https://img.shields.io/badge/Cloudflare_R2-F38020?style=flat&logo=cloudflare&logoColor=white)

---

## Features

### Phase 1 - Builder
| Feature | Description |
|---------|-------------|
| 부품 목록 | 6가지 카테고리별 부품 조회 |
| 부품 선택 | 클릭으로 부품 선택/해제 |
| 호환성 검증 | 선택한 부품 간 실시간 호환성 체크 (서버 + 클라이언트) |
| 3D 미리보기 | Three.js 기반 키보드 조합 시각화 |
| 가격 계산 | 레이아웃별 스위치 수량 반영한 총 가격 계산 |
| 회원가입/로그인 | JWT 기반 이메일 인증 시스템 |
| 다크 모드 | 시스템 설정 연동 + 수동 전환 |

### Phase 2 - Community & Social
| Feature | Description |
|---------|-------------|
| 빌드 저장/불러오기 | 로그인 사용자 빌드 CRUD |
| 빌드 공유 | 공개 빌드 목록 (인기순/최신순) + 좋아요 |
| 커뮤니티 게시판 | 카테고리별 게시글 (질문/리뷰/정보/빌드 공유) |
| 게시글 CRUD | 작성/수정/삭제 + 좋아요 |
| 댓글 시스템 | 댓글/답글 작성 및 삭제 (cascade) |
| 내 활동 | 내 게시물/댓글 조회 및 삭제 |
| 계정 관리 | 프로필 수정, 비밀번호 변경, 계정 삭제 |

### Phase 3 - Affiliate + Sound + Polish
| Feature | Description |
|---------|-------------|
| 타건 소리 업로드 | 스위치별 유저가 소리 파일 업로드 (mp3/wav/ogg, 5MB) |
| 소리 재생 | 스위치 카드에서 좋아요 1등 소리 즉시 재생 |
| 소리 좋아요 | 유저가 소리에 좋아요 토글, 대표 소리 결정 |
| 어필리에이트 링크 | 부품별 구매 링크 (판매처 연결) |
| 참고가 표시 | 가격은 참고가로 표시, 실제 구매는 외부 링크 |
| 파비콘 | 키보드 모티브 파비콘 및 앱 아이콘 |

---

## Compatibility Rules

6가지 부품 간 호환성 검사 규칙:

```
PCB <-> Case      : Layout + Mounting Type 일치
PCB <-> Plate     : Layout 일치
PCB <-> Switch    : Switch Type 일치
Plate <-> Case    : Layout 일치
Plate <-> Switch  : Switch Type 일치
Switch <-> Keycap : Stem Type 일치
```

검증은 클라이언트(즉시 피드백)와 서버(API) 양쪽에서 수행됩니다.

---

## Structure

```
keyboard-builder/
├── backend/
│   └── app/
│       ├── models/
│       │   ├── parts.py          # 부품 모델
│       │   ├── user.py           # 사용자 모델
│       │   ├── build.py          # 빌드 모델
│       │   └── community.py      # 게시글/댓글/좋아요 모델
│       ├── schemas/
│       │   ├── parts.py          # 부품 스키마
│       │   ├── auth.py           # 인증 스키마
│       │   ├── build.py          # 빌드 스키마
│       │   └── community.py      # 커뮤니티 스키마
│       ├── routers/
│       │   ├── parts.py          # 부품 API
│       │   ├── auth.py           # 인증 API
│       │   ├── builds.py         # 빌드 API
│       │   └── community.py      # 커뮤니티 API
│       ├── services/
│       │   └── compatibility.py  # 호환성 검증 로직
│       ├── auth.py               # JWT + bcrypt
│       ├── database.py           # DB 설정
│       ├── storage.py            # Cloudflare R2 파일 저장
│       ├── main.py               # FastAPI 앱
│       └── seed.py               # 시드 데이터
├── frontend/
│   ├── app/
│   │   ├── page.tsx              # 메인 페이지
│   │   ├── login/page.tsx        # 로그인/회원가입
│   │   ├── builder/page.tsx      # 빌더
│   │   ├── community/
│   │   │   ├── page.tsx          # 게시판 목록
│   │   │   ├── write/page.tsx    # 게시글 작성
│   │   │   └── posts/[id]/page.tsx  # 게시글 상세
│   │   ├── my-activity/page.tsx  # 내 활동
│   │   ├── account/page.tsx      # 계정 관리
│   │   ├── profile/page.tsx      # 프로필 수정
│   │   └── settings/page.tsx     # 설정
│   ├── components/
│   │   ├── site-header.tsx       # 공통 헤더
│   │   ├── user-menu.tsx         # 사용자 드롭다운 메뉴
│   │   ├── keyboard-3d.tsx       # 3D 키보드 시각화
│   │   ├── switch-sound-player.tsx  # 스위치 소리 재생 버튼
│   │   ├── switch-sound-panel.tsx   # 소리 목록/업로드 패널
│   │   └── ui/                   # shadcn/ui 컴포넌트
│   └── lib/
│       ├── types.ts              # TypeScript 타입
│       ├── api.ts                # API 클라이언트
│       ├── hooks.ts              # TanStack Query 훅
│       ├── auth-context.tsx      # 인증 상태 관리
│       └── compatibility.ts      # 클라이언트 호환성 검증
└── README.md
```

---

## API Endpoints

### Parts (`/api/parts`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/all` | 전체 부품 목록 조회 |
| GET | `/{category}` | 카테고리별 부품 조회 |
| GET | `/{category}/{id}` | 개별 부품 조회 |
| POST | `/compatibility/check` | 호환성 검사 |

### Auth (`/api/auth`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | - | 회원가입 |
| POST | `/login` | - | 로그인 (JWT 토큰 반환) |
| GET | `/me` | O | 현재 사용자 정보 |
| PUT | `/me` | O | 프로필 수정 |
| PUT | `/password` | O | 비밀번호 변경 |
| DELETE | `/me` | O | 계정 삭제 |

### Builds (`/api/builds`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/popular` | - | 인기 빌드 목록 |
| GET | `/recent` | - | 최신 빌드 목록 |
| POST | `` | O | 빌드 저장 |
| GET | `` | O | 내 빌드 목록 |
| GET | `/{id}` | O | 빌드 상세 |
| PUT | `/{id}` | O | 빌드 수정 |
| DELETE | `/{id}` | O | 빌드 삭제 |
| POST | `/{id}/like` | O | 빌드 좋아요 토글 |

### Community (`/api/community`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/me/posts` | O | 내 게시물 목록 |
| GET | `/me/comments` | O | 내 댓글 목록 |
| GET | `/posts` | - | 게시글 목록 (카테고리/정렬 필터) |
| GET | `/posts/{id}` | - | 게시글 상세 |
| POST | `/posts` | O | 게시글 작성 |
| PUT | `/posts/{id}` | O | 게시글 수정 |
| DELETE | `/posts/{id}` | O | 게시글 삭제 |
| POST | `/posts/{id}/like` | O | 게시글 좋아요 토글 |
| GET | `/posts/{id}/comments` | - | 댓글 목록 |
| POST | `/posts/{id}/comments` | O | 댓글 작성 |
| DELETE | `/comments/{id}` | O | 댓글 삭제 (답글 cascade) |

### Switch Sounds (`/api/parts`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/switches/{id}/sounds` | - | 스위치 소리 목록 (좋아요순) |
| POST | `/switches/{id}/sounds` | O | 소리 업로드 (mp3/wav/ogg, 5MB) |
| DELETE | `/sounds/{id}` | O | 내 소리 삭제 |
| POST | `/sounds/{id}/like` | O | 소리 좋아요 토글 |

---

## Run

### Prerequisites
- Python 3.9+
- Node.js 18+
- Docker (PostgreSQL)

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
| Community | http://localhost:3000/community |
| Login | http://localhost:3000/login |
| API Docs | http://localhost:8000/docs |

---

## Roadmap

- [x] Phase 1 - Builder
  - [x] 부품 목록 및 선택
  - [x] 호환성 검증 (서버 + 클라이언트)
  - [x] 3D 미리보기
  - [x] 가격 계산
  - [x] 다크 모드
  - [x] 사용자 로그인/회원가입
- [x] Phase 2 - Community & Social
  - [x] 빌드 저장/불러오기
  - [x] 빌드 공유 및 좋아요
  - [x] 커뮤니티 게시판 (CRUD + 좋아요)
  - [x] 댓글/답글 시스템
  - [x] 내 활동 (게시물/댓글 관리)
  - [x] 계정 관리 (프로필/비밀번호/삭제)
- [ ] Phase 3 - Affiliate + Sound + Polish
  - [ ] 타건 소리 (스위치별 유저 업로드 + 좋아요 + 재생)
  - [ ] 어필리에이트 (부품별 구매 링크 + 참고가 표시)
  - [ ] 파비콘 / 앱 아이콘
  - [ ] 더 많은 부품 데이터

---

## License

MIT License
