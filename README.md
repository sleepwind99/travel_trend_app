# 🌍 AI 여행 플래너 (AI Travel Planner)

> Claude AI와 실시간 웹 검색을 활용한 맞춤형 여행지 추천 서비스

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
- [검색 모드](#검색-모드)
- [프로젝트 구조](#프로젝트-구조)
- [API 엔드포인트](#api-엔드포인트)
- [개발 가이드](#개발-가이드)
- [배포](#배포)
- [라이선스](#라이선스)

## 소개

**AI 여행 플래너**는 사용자의 여행 목적지, 성별, 연령대를 기반으로 맞춤형 여행지를 추천하는 차세대 AI 기반 여행 플래닝 서비스입니다.

### 핵심 가치

- **🎯 맞춤형 추천**: 사용자의 인구통계학적 정보를 바탕으로 최적화된 여행지 제안
- **🔍 실시간 트렌드**: Tavily AI 검색으로 최신 여행 트렌드와 SNS 핫플레이스 반영
- **🤖 AI 분석**: Claude Sonnet 4.5가 검색 결과를 분석하여 신뢰도 높은 추천 생성
- **⚡ 실시간 스트리밍**: 점진적 데이터 로딩으로 빠른 사용자 경험 제공
- **♾️ 무한 스크롤**: 최대 21개의 추천 여행지를 자동으로 로드

## 주요 기능

### 1. 지능형 여행 추천
- 목적지, 성별, 연령대 기반 맞춤 추천
- 각 추천마다 6가지 상세 정보 제공:
  - 📍 제목 및 위치
  - 📝 상세 설명
  - 🎯 추천 활동
  - 💰 예상 비용
  - 🗓️ 최적 방문 시기
  - 🖼️ 관련 이미지
  - 🔗 외부 링크

### 2. 실시간 웹 검색
- **Tavily AI** 통합으로 3가지 병렬 검색:
  1. 최신 핫플레이스 & 인스타그램 인기 장소
  2. 연령/성별 맞춤 트렌드 여행지
  3. 숨은 명소 & 로컬 맛집
- 검색 깊이: Advanced 모드 (검색당 최대 5개 결과)
- 월 1,000회 무료 검색 제공

### 3. 스트리밍 응답
- Server-Sent Events (SSE) 기반 실시간 데이터 전송
- 문자 단위 점진적 업데이트
- 필드별 순차 로딩으로 즉각적인 피드백

### 4. 무한 스크롤
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

### Backend
- **Runtime**: Node.js (Next.js API Routes)
- **AI Model**:
  - Claude Sonnet 4.5 (`claude-sonnet-4-5-20250929`)
  - 최대 6,144 토큰, 온도 0.8
- **Search Engine**: Tavily AI Core (`@tavily/core`)
- **Image APIs**: Pexels & Pixabay (선택 사항)

### DevOps
- **Package Manager**: Yarn 4.10.3
- **Linting**: ESLint 9
- **Version Control**: Git

## 시작하기

### 사전 요구 사항

- Node.js 20.x 이상
- Yarn 4.x (자동 설치됨)
- Claude API Key ([Anthropic Console](https://console.anthropic.com/)에서 발급)
- Tavily API Key ([Tavily](https://tavily.com/)에서 무료 가입)

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

# 필수: Tavily AI 검색 API 키 (실시간 검색용)
TAVILY_API_KEY=tvly-...

# 선택: 이미지 API 키 (폴백용)
PEXELS_API_KEY=your_pexels_key
PIXABAY_API_KEY=your_pixabay_key

# 선택: 검색 모드 설정 (기본값: server)
SEARCH_MODE=server
```

### API 키 발급 방법

| 서비스 | 가격 | 발급 링크 | 용도 |
|--------|------|----------|------|
| **Claude AI** | 사용량 기반 | [console.anthropic.com](https://console.anthropic.com/) | AI 추천 생성 (필수) |
| **Tavily AI** | 1,000회/월 무료 | [tavily.com](https://tavily.com/) | 실시간 검색 (필수) |
| **Pexels** | 무료 | [pexels.com/api](https://www.pexels.com/api/) | 이미지 폴백 (선택) |
| **Pixabay** | 무료 | [pixabay.com/api](https://pixabay.com/api/docs/) | 이미지 폴백 (선택) |

## 검색 모드

앱은 2가지 검색 모드를 지원합니다. `SEARCH_MODE` 환경 변수로 설정할 수 있습니다.

### Mode 1: Server Search (기본값, 권장) ⭐

```bash
SEARCH_MODE="server"
```

#### 장점
- ✅ **빠름**: 총 ~20-25초
- ✅ **간단함**: 서버 → 검색 → Claude 추천
- ✅ **예측 가능**: 고정 비용
- ✅ **저렴함**: Serper API 사용 시 $1/1,000 쿼리

#### 작동 방식
1. 서버가 2개의 병렬 Serper API 호출 수행
2. 검색 결과를 Claude 프롬프트에 추가
3. Claude가 추천 생성

---

### Mode 2: Claude Tool Use (유연함) 🔧

```bash
SEARCH_MODE="claude_tools"
```

#### 장점
- ✅ **유연성**: Claude가 검색 시점/내용 결정
- ✅ **지능적**: Claude가 검색 쿼리 최적화
- ✅ **적응형**: 필요시 여러 번 검색 가능

#### 단점
- ⚠️ **느림**: 총 ~40-50초 (여러 API 라운드)
- ⚠️ **비용 변동**: Claude API 호출 2-3배 증가

#### 작동 방식
1. Claude가 검색 도구 수신
2. Claude가 검색 여부 결정
3. Claude가 도구를 통해 Serper 호출
4. Claude가 결과 분석
5. 필요시 추가 검색
6. Claude가 추천 생성

## 프로젝트 구조

```
travel-trend-app/
├── src/
│   └── app/
│       ├── api/
│       │   └── recommend/
│       │       └── route.ts          # AI 추천 API 엔드포인트
│       ├── layout.tsx                # 루트 레이아웃
│       ├── page.tsx                  # 메인 페이지 (클라이언트 컴포넌트)
│       ├── globals.css               # 전역 스타일
│       ├── icon.tsx                  # Favicon 생성기
│       ├── apple-icon.tsx            # Apple Touch Icon
│       ├── opengraph-image.tsx       # OG 이미지
│       └── twitter-image.tsx         # Twitter Card 이미지
├── public/                           # 정적 파일
├── .env.local                        # 환경 변수 (Git 제외)
├── CLAUDE.md                         # AI 개발 가이드
├── SEARCH_MODES_README.md           # 검색 모드 상세 설명
├── package.json                      # 의존성 관리
├── tsconfig.json                     # TypeScript 설정
├── tailwind.config.ts                # Tailwind 설정
└── next.config.ts                    # Next.js 설정
```

## API 엔드포인트

### POST `/api/recommend`

사용자 정보를 기반으로 AI 여행 추천을 생성합니다.

#### 요청 본문

```typescript
{
  destination: string;        // 여행 목적지 (예: "파리", "일본")
  gender: string;             // 성별 ("male" | "female" | "other")
  age: string;                // 연령대 ("teens" | "20s" | "30s" | "40s" | "50s+")
  count: number;              // 추천 개수 (기본값: 3)
  skipSearch?: boolean;       // 검색 건너뛰기 (기본값: false)
  searchContext?: string;     // 이전 검색 결과 재사용
  previousRecommendations?: string[]; // 중복 방지용 기존 추천 목록
}
```

#### 응답 형식 (Server-Sent Events)

```json
// 메타데이터
{
  "type": "metadata",
  "searchAvailable": true,
  "searchContext": "검색 컨텍스트...",
  "hasMore": true
}

// 필드 청크 (실시간 스트리밍)
{
  "type": "field_chunk",
  "index": 0,
  "field": "description",
  "data": { "chunk": "프랑스의" }
}

// 필드 완성
{
  "type": "field",
  "index": 0,
  "field": "title",
  "data": { "title": "에펠탑" }
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
    "link": "https://..."
  }
}

// 완료
{ "type": "complete" }
```

## 개발 가이드

### 개발 명령어

```bash
# 개발 서버 시작 (Turbopack)
yarn dev

# 프로덕션 빌드
yarn build

# 프로덕션 서버 실행
yarn start

# 코드 린팅
yarn lint
```

### TypeScript 경로 별칭

```typescript
import { Component } from '@/app/components/Component';
// @ = ./src/
```

### 주요 개발 참고사항

1. **클라이언트/서버 컴포넌트 분리**
   - `page.tsx`: 클라이언트 컴포넌트 (`"use client"`)
   - `layout.tsx`: 서버 컴포넌트
   - API Routes: 서버 사이드

2. **스트리밍 구현**
   - `ReadableStream` 사용
   - `TextDecoder`로 UTF-8 디코딩
   - 줄바꿈(`\n`)으로 메시지 분리

3. **상태 관리**
   - React `useState`와 `useCallback` 활용
   - 스켈레톤 UI로 낙관적 업데이트

4. **성능 최적화**
   - 이미지 지연 로딩 (`loading="lazy"`)
   - Intersection Observer로 무한 스크롤
   - 병렬 검색으로 응답 시간 단축

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
실시간 검색 사용 불가: Tavily API를 사용할 수 없음
```
**해결**: `TAVILY_API_KEY` 환경 변수 확인, 월 사용량 초과 여부 확인

#### 3. 빌드 오류
```
Type error: Cannot find module '@/...'
```
**해결**: `tsconfig.json`의 경로 별칭 확인, `yarn install` 재실행

## 기여하기

기여는 언제나 환영합니다!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 연락처

프로젝트 링크: [https://github.com/yourusername/travel-trend-app](https://github.com/yourusername/travel-trend-app)

---

<div align="center">

**Powered by [Claude AI](https://www.anthropic.com/claude) | Built with [Next.js](https://nextjs.org/)**

Made with ❤️ by developers, for travelers

</div>
