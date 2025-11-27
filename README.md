# 🌍 AI 여행 플래너 (AI Travel Planner)

> Claude AI와 실시간 웹 검색을 활용한 거래 내역 기반 맞춤형 여행지 추천 서비스

[![Next.js](https://img.shields.io/badge/Next.js-15.5.5-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Claude AI](https://img.shields.io/badge/Claude_AI-Sonnet_4.5-orange)](https://www.anthropic.com/claude)

## 📖 목차

- [소개](#소개)
- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [시작하기](#시작하기)
- [환경 변수 설정](#환경-변수-설정)
- [프로젝트 구조](#프로젝트-구조)
- [API 엔드포인트](#api-엔드포인트)
- [개발 가이드](#개발-가이드)
- [배포](#배포)

## 소개

**AI 여행 플래너**는 사용자의 거래 내역, 여행 목적지, 성별, 연령대를 분석하여 맞춤형 여행지를 추천하는 차세대 AI 기반 여행 플래닝 서비스입니다.

### 핵심 가치

- **📊 거래 내역 분석**: 최근 한 달간 소비 패턴을 분석하여 취향 파악
- **🎯 맞춤형 추천**: 사용자의 소비 성향과 인구통계학적 정보를 바탕으로 최적화된 여행지 제안
- **🔍 실시간 트렌드**: Serper API 검색으로 최신 여행 트렌드와 SNS 핫플레이스 반영
- **🤖 AI 분석**: Claude Sonnet 4.5가 검색 결과를 분석하여 신뢰도 높은 추천 생성
- **⚡ 실시간 스트리밍**: 점진적 데이터 로딩으로 빠른 사용자 경험 제공
- **♾️ 무한 스크롤**: 최대 21개의 추천 여행지를 자동으로 로드
- **👥 사용자 관리**: 여러 사용자의 프로필과 거래 내역 관리

## 주요 기능

### 1. 사용자 관리
- ✅ 사용자 추가/삭제/수정
- ✅ 사용자별 거래 내역 관리
- ✅ 거래 내역 기반 소비 패턴 분석
- ✅ 사용자별 맞춤 추천

### 2. 지능형 여행 추천
- 목적지, 성별, 연령대, 거래 내역 기반 맞춤 추천
- 각 추천마다 상세 정보 제공:
  - 📍 제목 및 위치
  - 📝 상세 설명
  - 🎯 추천 활동
  - 💰 예상 비용
  - 🗓️ 최적 방문 시기
  - 🖼️ 관련 이미지 (Google 이미지 검색)
  - 🔗 Google 검색 링크

### 3. 실시간 웹 검색
- **Serper API** 통합으로 2가지 병렬 검색:
  1. 최신 여행 트렌드 & 인기 장소
  2. 숨은 명소 & 로컬 맛집
- 빠른 응답 시간 (~20-25초)
- Google 이미지 검색으로 정확한 이미지 제공

### 4. 스트리밍 응답
- Server-Sent Events (SSE) 기반 실시간 데이터 전송
- 문자 단위 점진적 업데이트
- 필드별 순차 로딩으로 즉각적인 피드백

### 5. 무한 스크롤
- Intersection Observer API 활용
- 스켈레톤 UI로 로딩 상태 시각화
- 최대 21개 추천까지 자동 로드
- 중복 방지 로직 내장

## 기술 스택

### Frontend
- **Framework**: Next.js 15.5.5 (App Router)
- **React**: 19.1.0 (Server/Client Components)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Build Tool**: Turbopack (빠른 빌드 & HMR)
- **Component Architecture**: 모듈화된 컴포넌트 구조

### Backend
- **Runtime**: Node.js (Next.js API Routes)
- **AI Model**:
  - Claude Sonnet 4.5 (`claude-sonnet-4-5-20250929`)
  - 최대 6,144 토큰, 온도 0.8
- **Search Engine**: Serper API (Google 검색 & 이미지)
- **Data Storage**: JSON 파일 기반 (개발 환경)

### DevOps
- **Package Manager**: Yarn 4.10.3
- **Linting**: ESLint 9
- **Version Control**: Git

## 시작하기

### 사전 요구 사항

- Node.js 20.x 이상
- Yarn 4.x (자동 설치됨)
- Claude API Key ([Anthropic Console](https://console.anthropic.com/)에서 발급)
- Serper API Key ([Serper.dev](https://serper.dev/)에서 발급, $50 무료 크레딧)

### 설치

1. **저장소 클론**
```bash
git clone https://github.com/yourusername/travel-trend-app.git
cd travel-trend-app
```

2. **의존성 설치**
```bash
yarn install
```

3. **환경 변수 설정**
```bash
cp .env.local.example .env.local
# .env.local 파일을 열어 API 키를 입력하세요
```

4. **개발 서버 실행**
```bash
yarn dev
```

5. **브라우저에서 열기**
```
http://localhost:3000
```

## 환경 변수 설정

`.env.local` 파일에 다음 환경 변수를 설정하세요:

```bash
# 필수: Claude AI API 키
CLAUDE_API_KEY=sk-ant-api03-...

# 필수: Serper API 키 (Google 검색 & 이미지)
SERPER_API_KEY=your_serper_key

# 선택: 이미지 폴백 API 키
PEXELS_API_KEY=your_pexels_key
PIXABAY_API_KEY=your_pixabay_key
```

### API 키 발급 방법

| 서비스 | 가격 | 발급 링크 | 용도 |
|--------|------|----------|------|
| **Claude AI** | 사용량 기반 | [console.anthropic.com](https://console.anthropic.com/) | AI 추천 생성 (필수) |
| **Serper API** | $50 무료 크레딧 | [serper.dev](https://serper.dev/) | Google 검색 & 이미지 (필수) |
| **Pexels** | 무료 | [pexels.com/api](https://www.pexels.com/api/) | 이미지 폴백 (선택) |
| **Pixabay** | 무료 | [pixabay.com/api](https://pixabay.com/api/docs/) | 이미지 폴백 (선택) |

## 프로젝트 구조

```
travel-trend-app/
├── src/
│   ├── types/
│   │   └── index.ts                  # 공통 타입 정의
│   ├── components/
│   │   ├── Header.tsx                # 헤더 컴포넌트
│   │   ├── Footer.tsx                # 푸터 컴포넌트
│   │   ├── SearchForm.tsx            # 검색 폼
│   │   ├── RecommendationCard.tsx    # 추천 카드
│   │   ├── RecommendationsGrid.tsx   # 추천 그리드
│   │   ├── UserInfoModal.tsx         # 사용자 정보 모달
│   │   └── AddUserModal.tsx          # 사용자 추가 모달
│   └── app/
│       ├── api/
│       │   ├── recommend/
│       │   │   └── route.ts          # AI 추천 API
│       │   └── users/
│       │       ├── route.ts          # 사용자 목록/생성 API
│       │       └── [userId]/
│       │           └── route.ts      # 사용자 조회/수정/삭제 API
│       ├── layout.tsx                # 루트 레이아웃
│       ├── page.tsx                  # 메인 페이지 (비즈니스 로직)
│       └── globals.css               # 전역 스타일
├── data/
│   └── users.json                    # 사용자 데이터 (개발용)
├── .env.local                        # 환경 변수 (Git 제외)
├── CLAUDE.md                         # AI 개발 가이드
├── README.md                         # 프로젝트 문서
├── package.json                      # 의존성 관리
└── tsconfig.json                     # TypeScript 설정
```

## API 엔드포인트

### 사용자 관리 API

#### GET `/api/users`
모든 사용자 목록을 조회합니다.

**응답:**
```json
[
  {
    "id": "user_001",
    "name": "김철수",
    "gender": "male",
    "age": "20s",
    "transactions": [...]
  }
]
```

#### POST `/api/users`
새 사용자를 생성합니다.

**요청:**
```json
{
  "name": "김철수",
  "gender": "male",
  "age": "20s",
  "transactions": []
}
```

#### GET `/api/users/[userId]`
특정 사용자의 상세 정보를 조회합니다.

#### PUT `/api/users/[userId]`
사용자 정보를 업데이트합니다.

#### DELETE `/api/users/[userId]`
사용자를 삭제합니다.

### 추천 API

#### POST `/api/recommend`

사용자 정보와 거래 내역을 기반으로 AI 여행 추천을 생성합니다.

**요청:**
```typescript
{
  destination: string;                // 여행 목적지
  userId: string;                     // 사용자 ID
  count: number;                      // 추천 개수 (기본값: 3)
  skipSearch?: boolean;               // 검색 건너뛰기 (기본값: false)
  searchContext?: string;             // 이전 검색 결과 재사용
  previousRecommendations?: string[]; // 중복 방지용 기존 추천 목록
}
```

**응답 (Server-Sent Events):**
```json
// 메타데이터
{
  "type": "metadata",
  "searchAvailable": true,
  "searchContext": "검색 컨텍스트...",
  "hasMore": true
}

// 추천 완성
{
  "type": "recommendation",
  "index": 0,
  "data": {
    "title": "에펠탑",
    "location": "파리, 프랑스",
    "description": "...",
    "activities": ["전망대 관람", "야경 감상"],
    "priceRange": "입장료 15-25유로",
    "bestTime": "봄과 가을",
    "imageUrl": "https://...",
    "link": "https://google.com/search?q=..."
  }
}

// 이미지 업데이트
{
  "type": "image_update",
  "index": 0,
  "data": { "imageUrl": "https://..." }
}

// 완료
{ "type": "complete" }
```

## 개발 가이드

### 개발 명령어

```bash
# 개발 서버 시작 (Turbopack, Hot Reload)
yarn dev

# 프로덕션 빌드
yarn build

# 프로덕션 서버 실행
yarn start

# 코드 린팅
yarn lint
```

### 컴포넌트 구조

프로젝트는 모듈화된 컴포넌트 구조를 따릅니다:

1. **프레젠테이션 컴포넌트** (`/src/components`)
   - UI 렌더링에만 집중
   - 재사용 가능한 독립 컴포넌트
   - Props를 통한 데이터 전달

2. **컨테이너 컴포넌트** (`/src/app/page.tsx`)
   - 비즈니스 로직 처리
   - 상태 관리
   - API 호출

3. **타입 정의** (`/src/types/index.ts`)
   - 전역 타입 정의
   - 컴포넌트 간 타입 공유

### TypeScript 경로 별칭

```typescript
import { UserData } from '@/types';
import Header from '@/components/Header';
// @ = ./src/
```

### 주요 개발 참고사항

1. **클라이언트/서버 컴포넌트 분리**
   - `page.tsx`: 클라이언트 컴포넌트 (`"use client"`)
   - 모든 `/components`: 클라이언트 컴포넌트
   - `layout.tsx`: 서버 컴포넌트
   - API Routes: 서버 사이드

2. **스트리밍 구현**
   - `ReadableStream` 사용
   - `TextDecoder`로 UTF-8 디코딩
   - 줄바꿈(`\n`)으로 메시지 분리

3. **상태 관리**
   - React `useState`와 `useCallback` 활용
   - 스켈레톤 UI로 낙관적 업데이트
   - 모달 상태 관리

4. **성능 최적화**
   - 이미지 지연 로딩 (`loading="lazy"`)
   - Intersection Observer로 무한 스크롤
   - 병렬 검색으로 응답 시간 단축
   - 컴포넌트 분리로 재렌더링 최적화

## 배포

### Vercel (권장)

1. [Vercel](https://vercel.com)에서 GitHub 저장소 연결
2. 환경 변수 추가 (Settings → Environment Variables)
3. 자동 배포 완료

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/travel-trend-app)

### 기타 플랫폼

- **Netlify**: `next build` 후 `.next` 폴더 배포
- **AWS**: Amplify 또는 EC2 + PM2
- **Docker**: Dockerfile 생성 후 컨테이너화

## 트러블슈팅

### 일반적인 문제

#### 1. API 키 오류
```
Error: Invalid API key
```
**해결**: `.env.local` 파일의 API 키가 올바른지 확인

#### 2. 검색 사용 불가 경고
```
실시간 검색 사용 불가: Serper API를 사용할 수 없음
```
**해결**: `SERPER_API_KEY` 환경 변수 확인, 크레딧 잔액 확인

#### 3. 빌드 오류
```
Type error: Cannot find module '@/...'
```
**해결**: `tsconfig.json`의 경로 별칭 확인, `yarn install` 재실행

#### 4. 사용자 데이터 오류
```
Error reading users data
```
**해결**: `data/users.json` 파일이 올바른 JSON 형식인지 확인

## 기여하기

기여는 언제나 환영합니다!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

---

<div align="center">

**Powered by [Claude AI](https://www.anthropic.com/claude) | Built with [Next.js](https://nextjs.org/)**

Made with ❤️ for smart travelers

</div>
