/**
 * 여행 추천 AI 프롬프트
 *
 * 사용자의 거래 내역 기반 맞춤형 여행지 추천을 위한 Claude AI 프롬프트
 */

interface UserData {
  name: string;
  gender: string;
  age: string;
}

interface PromptParams {
  destination: string;
  userData: UserData;
  transactionAnalysis: string;
  currentDate: string;
  currentSeason: string;
  requestCount: number;
  searchAvailable: boolean;
  searchContext: string;
  previousRecommendations: string[];
}

/**
 * 시스템 프롬프트 생성
 */
export function generateSystemPrompt(params: {
  searchAvailable: boolean;
  currentDate: string;
}): string {
  const { searchAvailable, currentDate } = params;

  return `당신은 최신 여행 트렌드와 SNS 핫플레이스에 정통한 여행 전문가입니다.
${searchAvailable
    ? "실시간 웹 검색 결과를 바탕으로 정확하고 최신의 여행지를 추천해야 합니다."
    : "당신의 학습된 지식을 바탕으로 인기있고 검증된 여행지를 추천해야 합니다. 실시간 검색 결과는 사용할 수 없지만, 일반적으로 인기있는 명소와 트렌디한 장소를 추천해주세요."}
인스타그램, 여행 블로그, 틱톡에서 현재 인기있는 장소들을 포함하여 추천해야 합니다.
구체적인 장소명, 실용적인 정보, 그리고 왜 지금 이 장소가 트렌디한지 설명해야 합니다.
오늘 날짜(${currentDate})를 기준으로 실제로 존재하고 방문 가능한 장소만 추천해야 합니다.

⚠️ 이미지 중요 사항:
- imageSearchQuery: 장소명의 영어 번역 (예: "Eiffel Tower Paris", "Shibuya Sky Tokyo")
- 서버가 자동으로 이미지를 검색하므로 정확한 영어 검색어만 제공하면 됩니다

🚨 중요: 응답은 반드시 유효한 JSON 배열 형식으로만 제공해야 합니다. 다른 텍스트, 설명, 주석을 포함하지 마세요. JSON만 출력하세요.`;
}

/**
 * 사용자 프롬프트 생성
 */
export function generateUserPrompt(params: PromptParams): string {
  const {
    destination,
    userData,
    transactionAnalysis,
    currentDate,
    currentSeason,
    requestCount,
    searchAvailable,
    searchContext,
    previousRecommendations
  } = params;

  return `오늘은 ${currentDate}이고, 현재 계절은 ${currentSeason}입니다.

${searchAvailable
    ? searchContext
    : `⚠️ 주의: 실시간 웹 검색을 사용할 수 없습니다. 당신의 학습된 지식을 바탕으로 일반적으로 인기있고 검증된 여행지를 추천해주세요.
가능한 한 구체적이고 실제로 존재하는 장소를 추천해주세요.`}

${previousRecommendations.length > 0
    ? `🚨 중요 - 중복 방지:
이미 추천된 여행지 목록 (절대 다시 추천하지 마세요):
${previousRecommendations.map((title: string, idx: number) => `${idx + 1}. ${title}`).join('\n')}

위 ${previousRecommendations.length}개 장소와 완전히 다른, 새로운 장소만 추천해야 합니다.
같은 건물, 같은 구역, 유사한 이름의 장소도 피해주세요.
`
    : ''}

다음 사용자 정보를 바탕으로 구체적이고 트렌디한 여행지 ${requestCount}곳을 추천해 주세요:

=== 사용자 프로필 ===
- 이름: ${userData.name}
- 성별: ${userData.gender}
- 연령대: ${userData.age}
- 목적지: ${destination}

=== 사용자 소비 패턴 분석 (최근 한 달간 거래 내역) ===
${transactionAnalysis}

💡 위의 거래 내역을 분석하여 사용자의 관심사와 라이프스타일을 파악하고, 이를 반영한 맞춤형 여행지를 추천해주세요.

🚨 매우 중요 - 각 추천은 반드시:
1. 완전히 다른 장소여야 합니다 (같은 건물/구역/거리의 다른 가게 금지)
2. 서로 다른 카테고리여야 합니다 (관광지, 카페, 레스토랑, 쇼핑, 체험 등을 골고루)
3. 다양한 지역에 분산되어야 합니다

다음 JSON 형식으로 정확히 ${requestCount}개의 추천을 제공해 주세요 (더 많거나 적게 제공하지 마세요):

[
  {
    "title": "구체적인 장소 이름 (예: 시부야 스카이 전망대, 파리 생제르맹 카페거리)",
    "location": "정확한 위치 (도시, 구체적 지역/구)",
    "description": "해당 장소에 대한 간결한 설명 (2-3문장, 최대 150자). 반드시 다음을 포함: (1) 왜 지금 인기있는지 (2) SNS에서 어떤 점이 핫한지 (3) 왜 이 사용자에게 적합한지. 간결하고 핵심적인 내용만 작성.",
    "activities": ["구체적 활동 1", "구체적 활동 2", "구체적 활동 3", "추가 활동..."],
    "priceRange": "비용 항목과 금액만 간단히 (예: 입장료 15,000원 / 식사비 2만원 / 무료)",
    "bestTime": "계절과 시간대만 간단히 (예: 가을, 오후 / 4-6월, 저녁 / 연중, 낮)",
    "imageSearchQuery": "장소명의 영어 번역 (예: Eiffel Tower Paris, Shibuya Sky Tokyo)",
    "link": "위 검색 결과에서 제공된 실제 URL을 사용하거나, 해당 장소의 공식 웹사이트/관광 정보 링크. 반드시 유효한 전체 URL 형식이어야 함 (예: https://example.com)"
  }
]

필수 요구사항:
1. **트렌드 반영**: ${requestCount}곳 중 최소 ${Math.floor(requestCount / 2)}곳은 최근 1-2년 사이 SNS에서 급부상한 핫플레이스여야 함
2. **구체성**: "파리" ❌ → "몽마르트 언덕의 르 물랭 드 라 갈레트" ✅
3. **랜드마크 + 핫플 믹스**:
   - 2-3곳: 전통적 랜드마크 (필수 방문지)
   - 3-4곳: SNS/블로그 핫플레이스 (인스타그래머블, 로컬 맛집, 숨은 명소)
4. **활동 구체성**: "사진 찍기" ❌ → "루프탑에서 일몰 타임랩스 촬영, 시그니처 메뉴 '○○○' 맛보기" ✅
5. **가격 정보**: 항목명과 금액만 간단히 (예: "입장료 15,000원", "식사비 2만원", "무료")
6. **현재성**: ${currentDate} 기준으로 실제 운영중이고 방문 가능한 곳만 추천
7. **타겟 맞춤**: 위의 거래 내역 분석에서 파악한 사용자의 관심사, 소비 패턴, 라이프스타일을 적극 반영하여 해당 사용자가 실제로 좋아할만한 스타일의 장소를 추천
8. **이미지 검색어**: imageSearchQuery를 정확한 영어로 작성 (장소명 + 도시, 예: "Shibuya Sky Tokyo", "Eiffel Tower Paris")
9. **링크 필수**: 각 추천 장소마다 반드시 위 검색 결과에 포함된 URL 중 하나를 선택하여 link 필드에 포함하세요. 검색 결과의 "URL: " 부분에 있는 실제 링크를 사용하세요. 링크가 없으면 https://www.google.com/search?q=장소명+도시 형식으로 생성하세요

예시:
- 좋은 추천: "홍대 '연남동 자이언트 팬케이크 하우스' - 인스타그램 140만 좋아요, 3층 높이 팬케이크 포토존"
- 나쁜 추천: "홍대 카페거리 - 다양한 카페가 있음"`;
}

/**
 * 완전한 프롬프트 세트 생성 (편의 함수)
 */
export function generatePrompts(params: PromptParams) {
  return {
    systemPrompt: generateSystemPrompt({
      searchAvailable: params.searchAvailable,
      currentDate: params.currentDate
    }),
    userPrompt: generateUserPrompt(params)
  };
}
