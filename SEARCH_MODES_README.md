# 🔍 검색 모드 사용 가이드

이 프로젝트는 두 가지 검색 방식을 지원합니다.

## 📊 빠른 비교

| 특징 | Mode 1: Server (추천) | Mode 2: Claude Tools |
|------|---------------------|---------------------|
| **속도** | ⚡⚡⚡ 20-25초 | ⚡ 40-50초 |
| **비용** | 💰 저렴 ($1/1K 쿼리) | 💰💰 보통 (Claude 2-3배) |
| **유연성** | ⭐⭐ 고정 검색 | ⭐⭐⭐ Claude 판단 |
| **예측 가능성** | ✅ 높음 | ⚠️ 변동 |
| **사용 추천** | 일반 사용 | 실험/고급 기능 |

---

## 🚀 Mode 1: Server Search (기본, 추천)

### 설정
```bash
# .env.local
SEARCH_MODE="server"
SERPER_API_KEY="your_serper_api_key"
```

### 동작 방식
```
사용자 요청
   ↓
서버가 Serper API로 2번 병렬 검색
   ↓
검색 결과를 Claude 프롬프트에 포함
   ↓
Claude가 결과 분석 및 추천 생성
   ↓
응답 반환 (20-25초)
```

### 장점
- ⚡ **빠름**: 한 번의 Claude API 호출
- 💰 **저렴**: Serper $1/1,000 쿼리
- 🎯 **예측 가능**: 항상 2번 검색
- 🛠️ **간단**: 코드 흐름 단순

### 단점
- ⚠️ 검색 쿼리가 고정됨
- ⚠️ Claude가 추가 검색 불가

### 성능
```
Serper 검색: ~1-2초
Claude 생성: ~18-20초
이미지 검색: ~0.001초
───────────────────────
총 소요 시간: ~20-25초
```

---

## 🧠 Mode 2: Claude Tool Use (고급)

### 설정
```bash
# .env.local
SEARCH_MODE="claude_tools"
SERPER_API_KEY="your_serper_api_key"
```

### 동작 방식
```
사용자 요청
   ↓
Claude에게 검색 도구 제공
   ↓
Claude가 검색 필요성 판단
   ↓
Claude가 최적 검색 쿼리 생성
   ↓
Serper API 호출 (1-3번)
   ↓
검색 결과를 Claude에게 전달
   ↓
Claude가 결과 분석
   ↓
(필요시 추가 검색 반복)
   ↓
최종 추천 생성
   ↓
응답 반환 (40-50초)
```

### 장점
- 🧠 **똑똑함**: Claude가 최적 검색 쿼리 생성
- 🔄 **유연함**: 필요시 추가 검색 가능
- 🎯 **정확함**: Claude가 검색 타이밍 제어
- 🆕 **혁신적**: AI가 스스로 도구 사용

### 단점
- ⏱️ **느림**: 여러 번의 API 왕복 (40-50초)
- 💰 **비용**: Claude API 호출 2-3배 증가
- 🔀 **변동성**: 검색 횟수 예측 불가
- 🐛 **복잡함**: 디버깅 어려움

### 성능
```
Claude 초기 판단: ~8-10초
Serper 검색 1차: ~1-2초
Claude 분석: ~8-10초
Serper 검색 2차: ~1-2초 (필요시)
Claude 최종 생성: ~10-15초
이미지 검색: ~0.001초
───────────────────────
총 소요 시간: ~40-50초
```

---

## 🔧 사용 예시

### 빠른 응답이 필요한 경우
```bash
# .env.local
SEARCH_MODE="server"  # ⭐ 추천
```
**사용 사례:**
- 프로덕션 환경
- 사용자 대면 서비스
- 비용 최적화 필요

### Claude의 판단이 필요한 경우
```bash
# .env.local
SEARCH_MODE="claude_tools"
```
**사용 사례:**
- 실험 및 연구
- 복잡한 쿼리
- AI 자율성 테스트
- 데모/프로토타입

---

## 📈 비용 비교 (1,000 사용자 기준)

### Mode 1: Server
```
Serper: 2 쿼리/요청 × 1,000 = 2,000 쿼리 = $2
Claude: 1 호출/요청 × 1,000 = 1,000 호출 = ~$5-10
────────────────────────────────────────────
총 비용: ~$7-12
```

### Mode 2: Claude Tools
```
Serper: 2-3 쿼리/요청 × 1,000 = 2,500 쿼리 = $2.50
Claude: 3-4 호출/요청 × 1,000 = 3,500 호출 = ~$17-35
────────────────────────────────────────────
총 비용: ~$20-38 (약 2.5-3배)
```

---

## 🎯 추천 설정

### 대부분의 경우
```bash
SEARCH_MODE="server"  # ⭐⭐⭐
```

### 고급 사용자/실험
```bash
SEARCH_MODE="claude_tools"
```

### API 키 없는 경우
```bash
# SERPER_API_KEY 없으면 자동으로 Claude 지식만 사용
# (검색 없음, 가장 빠름)
```

---

## 🚨 문제 해결

### Mode 1에서 검색 결과 없음
```bash
# Serper API 키 확인
echo $SERPER_API_KEY

# 로그 확인
# "⚠️  Serper API key not configured" 메시지 확인
```

### Mode 2에서 너무 느림
```bash
# Server 모드로 전환
SEARCH_MODE="server"
```

### 비용이 너무 높음
```bash
# Server 모드 사용 + Serper만 사용
SEARCH_MODE="server"
SERPER_API_KEY="..."
# TAVILY_API_KEY는 제거
```

---

## 📝 로그 확인

### Server Mode
```
🔧 SEARCH_MODE: server (서버 검색 → Claude)
🔍 Searching travel trends with Serper API...
⏱️  Serper API searches completed in 1234ms
🤖 Starting Claude AI response generation...
⏱️  Claude AI response generation completed in 18456ms
```

### Claude Tools Mode
```
🔧 SEARCH_MODE: claude_tools (Claude가 직접 검색)
🔧 Using Claude Tool Use (Claude searches directly)
🔄 Claude Tool Use iteration 1...
🔧 Claude requested tool use
🔍 Tool: serper_search, Query: {"query":"도쿄 2025 핫플레이스"}
✅ Search completed: 3 results
🔄 Claude Tool Use iteration 2...
✅ Claude completed response
```
