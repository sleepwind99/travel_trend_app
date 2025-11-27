import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import axios from "axios";
import { parse as parsePartialJson } from "partial-json";

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

// 검색 모드 설정: 'server' (기본) 또는 'claude_tools'
const SEARCH_MODE = process.env.SEARCH_MODE || 'server';
const SERPER_API_KEY = process.env.SERPER_API_KEY;

// Serper API로 실시간 여행 트렌드 검색 (방법 1: 서버 검색)
async function searchTravelTrendsSerper(
  destination: string,
  gender: string,
  age: string,
  currentDate: string
): Promise<{ searchContext: string; searchAvailable: boolean }> {
  const searchStartTime = Date.now();

  if (!SERPER_API_KEY) {
    console.warn("⚠️  Serper API key not configured. Falling back to Claude AI's knowledge only.");
    return {
      searchContext: "",
      searchAvailable: false
    };
  }

  try {
    // 최적화된 검색 쿼리 (2개)
    const searchQueries = [
      `${destination} 여행 추천 2025 최신 핫플레이스 ${age}`,
      `${destination} 인기 여행지 맛집 ${gender}`,
    ];

    console.log("🔍 Searching travel trends with Serper API...");
    const serperStartTime = Date.now();

    // 병렬로 검색 실행
    const searchPromises = searchQueries.map(async (query) => {
      try {
        const response = await axios.post(
          'https://google.serper.dev/search',
          {
            q: query,
            num: 3, // 결과 3개
          },
          {
            headers: {
              'X-API-KEY': SERPER_API_KEY,
              'Content-Type': 'application/json',
            },
            timeout: 5000,
          }
        );
        return response.data;
      } catch (error: unknown) {
        const err = error as { response?: { status?: number }; message?: string };
        if (err?.response?.status === 429) {
          console.error(`⚠️  Serper API quota exceeded for query: ${query}`);
        } else if (err?.response?.status === 401) {
          console.error(`⚠️  Serper API authentication failed. Check your API key.`);
        } else {
          console.error(`⚠️  Search failed for query: ${query}`, err?.message || error);
        }
        return null;
      }
    });

    const results = await Promise.all(searchPromises);
    const serperEndTime = Date.now();
    const serperDuration = serperEndTime - serperStartTime;
    console.log(`⏱️  Serper API searches completed in ${serperDuration}ms (${(serperDuration / 1000).toFixed(2)}s)`);

    // 모든 검색이 실패한 경우
    const successfulResults = results.filter((r) => r !== null);
    if (successfulResults.length === 0) {
      console.warn("⚠️  All Serper searches failed. Falling back to Claude AI's knowledge only.");
      return {
        searchContext: "",
        searchAvailable: false
      };
    }

    // 검색 결과를 구조화된 텍스트로 변환
    let searchContext = `\n\n=== 실시간 웹 검색 결과 (${currentDate} 기준, Serper API) ===\n\n`;

    results.forEach((result, index) => {
      if (result && result.organic) {
        searchContext += `\n검색 쿼리 ${index + 1}: ${searchQueries[index]}\n`;

        if (result.answerBox?.answer) {
          searchContext += `AI 요약: ${result.answerBox.answer}\n\n`;
        }

        searchContext += "관련 정보:\n";
        result.organic.forEach((item: { title: string; link: string; snippet: string }, idx: number) => {
          searchContext += `${idx + 1}. ${item.title}\n`;
          searchContext += `   URL: ${item.link}\n`;
          searchContext += `   내용: ${item.snippet}\n\n`;
        });
      }
    });

    searchContext += "\n=== 검색 결과 끝 ===\n\n";
    searchContext += "위의 최신 검색 결과를 바탕으로 실제로 현재 운영 중이고 인기있는 장소를 추천해주세요.\n";

    const searchEndTime = Date.now();
    const totalSearchDuration = searchEndTime - searchStartTime;
    console.log(`✅ Serper search completed. Context length: ${searchContext.length} characters`);
    console.log(`⏱️  Total search process duration: ${totalSearchDuration}ms (${(totalSearchDuration / 1000).toFixed(2)}s)`);

    return {
      searchContext,
      searchAvailable: true
    };
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("❌ Serper search unexpected error:", err?.message || error);
    console.warn("⚠️  Falling back to Claude AI's knowledge only.");
    return {
      searchContext: "",
      searchAvailable: false
    };
  }
}

// 여러 이미지 API에서 순차적으로 검색 (최적화: 빠른 API 우선)
async function fetchImageFromMultipleSources(query: string): Promise<string> {
  // 1. Unsplash (가장 빠름 - API 키 불필요, 바로 URL 생성)
  const unsplashUrl = `https://source.unsplash.com/1200x800/?${encodeURIComponent(query)}`;
  console.log(`✓ Using Unsplash for: ${query}`);
  return unsplashUrl;

  // 아래 코드는 Unsplash가 실패할 경우를 대비한 폴백 (현재는 도달 불가)
  // Unsplash는 항상 URL을 반환하므로 추가 검색 불필요
}

export async function POST(request: Request) {
  const requestStartTime = Date.now();
  console.log("\n" + "=".repeat(80));
  console.log("🚀 NEW RECOMMENDATION REQUEST STARTED");
  console.log("=".repeat(80));

  try {
    const body = await request.json();
    const { destination, gender, age, count = 3, skipSearch = false, searchContext: providedSearchContext, previousRecommendations = [] } = body;

    console.log(`📍 Request params: destination="${destination}", gender="${gender}", age="${age}", count=${count}`);

    if (!destination || !gender || !age) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // count는 3, 6, 9... 최대 21까지
    const requestCount = Math.min(Math.max(3, count), 21);

    // Get current date
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const currentDate = `${year}년 ${month}월 ${day}일`;
    const currentSeason = month >= 3 && month <= 5 ? "봄" :
                          month >= 6 && month <= 8 ? "여름" :
                          month >= 9 && month <= 11 ? "가을" : "겨울";

    // 실시간 웹 검색으로 최신 여행 트렌드 수집
    let searchContext = "";
    let searchAvailable = true;

    if (skipSearch && providedSearchContext) {
      // 이전 검색 결과 재사용 (추가 로드 시)
      console.log("Reusing previous search context...");
      searchContext = providedSearchContext;
      searchAvailable = true;
    } else if (SEARCH_MODE === 'server') {
      // 방법 1: 서버에서 검색 후 Claude에게 전달
      console.log("🔧 SEARCH_MODE: server (서버 검색 → Claude)");
      console.log("Fetching real-time travel trends with Serper...");
      const searchResult = await searchTravelTrendsSerper(destination, gender, age, currentDate);
      searchContext = searchResult.searchContext;
      searchAvailable = searchResult.searchAvailable;
    } else {
      // 방법 2는 아래에서 Claude Tool Use로 처리
      console.log("🔧 SEARCH_MODE: claude_tools (Claude가 직접 검색)");
      searchContext = "";
      searchAvailable = false; // Tool Use에서는 검색 결과를 프롬프트에 포함하지 않음
    }

    const systemPrompt = `당신은 최신 여행 트렌드와 SNS 핫플레이스에 정통한 여행 전문가입니다.
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

    const userPrompt = `오늘은 ${currentDate}이고, 현재 계절은 ${currentSeason}입니다.

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

다음 정보를 바탕으로 구체적이고 트렌디한 여행지 ${requestCount}곳을 추천해 주세요:

- 목적지: ${destination}
- 성별: ${gender}
- 연령대: ${age}

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
7. **타겟 맞춤**: 해당 연령대와 성별이 실제로 좋아할만한 스타일의 장소
8. **이미지 검색어**: imageSearchQuery를 정확한 영어로 작성 (장소명 + 도시, 예: "Shibuya Sky Tokyo", "Eiffel Tower Paris")
9. **링크 필수**: 각 추천 장소마다 반드시 위 검색 결과에 포함된 URL 중 하나를 선택하여 link 필드에 포함하세요. 검색 결과의 "URL: " 부분에 있는 실제 링크를 사용하세요. 링크가 없으면 https://www.google.com/search?q=장소명+도시 형식으로 생성하세요

예시:
- 좋은 추천: "홍대 '연남동 자이언트 팬케이크 하우스' - 인스타그램 140만 좋아요, 3층 높이 팬케이크 포토존"
- 나쁜 추천: "홍대 카페거리 - 다양한 카페가 있음"`;

    // Claude AI로부터 응답 받기
    console.log("🤖 Starting Claude AI response generation...");
    const claudeStartTime = Date.now();

    let responseText = "";

    if (SEARCH_MODE === 'claude_tools' && SERPER_API_KEY) {
      // 방법 2: Claude Tool Use - Claude가 직접 검색
      console.log("🔧 Using Claude Tool Use (Claude searches directly)");

      // Serper 검색 도구 정의
      const tools: Anthropic.Tool[] = [
        {
          name: "serper_search",
          description: "Google 검색을 통해 최신 여행 정보, 핫플레이스, 맛집 정보를 검색합니다. 실시간 트렌드와 SNS 인기 장소를 찾는데 유용합니다.",
          input_schema: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "검색할 쿼리 (예: '도쿄 2025 핫플레이스', '파리 맛집 추천')"
              },
              num_results: {
                type: "number",
                description: "검색 결과 개수 (기본값: 3)",
                default: 3
              }
            },
            required: ["query"]
          }
        }
      ];

      // 초기 메시지
      const messages: Anthropic.MessageParam[] = [
        {
          role: "user",
          content: userPrompt
        }
      ];

      let continueLoop = true;
      let loopCount = 0;
      const maxLoops = 5; // 무한 루프 방지

      while (continueLoop && loopCount < maxLoops) {
        loopCount++;
        console.log(`🔄 Claude Tool Use iteration ${loopCount}...`);

        const response = await anthropic.messages.create({
          model: "claude-sonnet-4-5-20250929",
          max_tokens: 4096,
          temperature: 0.8,
          system: systemPrompt,
          messages: messages,
          tools: tools,
        });

        // 응답 처리
        if (response.stop_reason === 'tool_use') {
          // Claude가 도구 사용 요청
          console.log("🔧 Claude requested tool use");

          const toolResults: Anthropic.MessageParam[] = [];

          for (const content of response.content) {
            if (content.type === 'tool_use') {
              console.log(`🔍 Tool: ${content.name}, Query: ${JSON.stringify(content.input)}`);

              if (content.name === 'serper_search') {
                const { query, num_results = 3 } = content.input as { query: string; num_results?: number };

                try {
                  // Serper API 호출
                  const searchResponse = await axios.post(
                    'https://google.serper.dev/search',
                    { q: query, num: num_results },
                    {
                      headers: {
                        'X-API-KEY': SERPER_API_KEY,
                        'Content-Type': 'application/json',
                      },
                      timeout: 5000,
                    }
                  );

                  const searchResults = searchResponse.data;
                  let resultText = `검색 결과 (쿼리: "${query}"):\n\n`;

                  if (searchResults.answerBox?.answer) {
                    resultText += `AI 요약: ${searchResults.answerBox.answer}\n\n`;
                  }

                  if (searchResults.organic && searchResults.organic.length > 0) {
                    resultText += "상위 검색 결과:\n";
                    searchResults.organic.forEach((item: { title: string; link: string; snippet: string }, idx: number) => {
                      resultText += `${idx + 1}. ${item.title}\n`;
                      resultText += `   URL: ${item.link}\n`;
                      resultText += `   요약: ${item.snippet}\n\n`;
                    });
                  } else {
                    resultText += "검색 결과가 없습니다.\n";
                  }

                  toolResults.push({
                    role: "user",
                    content: [
                      {
                        type: "tool_result",
                        tool_use_id: content.id,
                        content: resultText,
                      }
                    ]
                  });

                  console.log(`✅ Search completed: ${searchResults.organic?.length || 0} results`);
                } catch (error) {
                  console.error("❌ Serper search failed:", error);
                  toolResults.push({
                    role: "user",
                    content: [
                      {
                        type: "tool_result",
                        tool_use_id: content.id,
                        content: "검색에 실패했습니다. 일반적인 지식을 바탕으로 추천해주세요.",
                        is_error: true,
                      }
                    ]
                  });
                }
              }
            }
          }

          // 도구 결과를 메시지에 추가
          messages.push({
            role: "assistant",
            content: response.content
          });
          messages.push(...toolResults);

        } else if (response.stop_reason === 'end_turn') {
          // Claude가 최종 응답 완료
          console.log("✅ Claude completed response");

          for (const content of response.content) {
            if (content.type === 'text') {
              responseText += content.text;
            }
          }

          continueLoop = false;
        } else {
          // 기타 종료 사유
          console.log(`⚠️  Unexpected stop reason: ${response.stop_reason}`);

          for (const content of response.content) {
            if (content.type === 'text') {
              responseText += content.text;
            }
          }

          continueLoop = false;
        }
      }

      if (loopCount >= maxLoops) {
        console.warn("⚠️  Max tool use loops reached");
      }

      // Tool Use 모드: responseText 파싱 및 스트리밍
      const claudeEndTime = Date.now();
      const claudeDuration = claudeEndTime - claudeStartTime;
      console.log(`⏱️  Claude AI (Tool Use) completed in ${claudeDuration}ms (${(claudeDuration / 1000).toFixed(2)}s)`);

      // JSON 파싱
      let cleanedResponse = responseText.trim();
      if (cleanedResponse.startsWith("```")) {
        cleanedResponse = cleanedResponse.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
      }
      cleanedResponse = cleanedResponse.trim();
      const jsonMatch = cleanedResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        cleanedResponse = jsonMatch[0];
      }

      let recommendations;
      try {
        recommendations = JSON.parse(cleanedResponse);
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        throw new Error("AI 응답을 파싱하는데 실패했습니다.");
      }

      console.log(`📦 Parsed ${recommendations.length} recommendations`);

      // 중복 제거
      const filteredRecommendations = recommendations.filter((rec: { title: string }) => {
        return !previousRecommendations.includes(rec.title);
      });

      recommendations = filteredRecommendations;
      console.log(`✅ Returning ${recommendations.length} recommendations`);

      // 스트리밍 응답 생성
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            controller.enqueue(
              encoder.encode(
                JSON.stringify({
                  type: 'metadata',
                  searchAvailable,
                  searchContext: skipSearch ? undefined : searchContext,
                  hasMore: recommendations.length === requestCount,
                }) + '\n'
              )
            );

            const imageSearchPromises = recommendations.map(async (rec: unknown, i: number) => {
              const typedRec = rec as { imageSearchQuery?: string; title: string };
              const searchQuery = typedRec.imageSearchQuery || typedRec.title;
              const imageUrl = await fetchImageFromMultipleSources(searchQuery);
              return { index: i, imageUrl };
            });

            for (let i = 0; i < recommendations.length; i++) {
              const rec = recommendations[i] as {
                title: string;
                location: string;
                description: string;
                activities: string[];
                priceRange: string;
                bestTime: string;
                link: string;
              };

              controller.enqueue(
                encoder.encode(
                  JSON.stringify({
                    type: 'field',
                    index: i,
                    field: 'header',
                    data: { title: rec.title, location: rec.location },
                  }) + '\n'
                )
              );

              controller.enqueue(
                encoder.encode(
                  JSON.stringify({
                    type: 'field',
                    index: i,
                    field: 'description',
                    data: { description: rec.description },
                  }) + '\n'
                )
              );

              controller.enqueue(
                encoder.encode(
                  JSON.stringify({
                    type: 'field',
                    index: i,
                    field: 'activities',
                    data: { activities: rec.activities },
                  }) + '\n'
                )
              );

              controller.enqueue(
                encoder.encode(
                  JSON.stringify({
                    type: 'field',
                    index: i,
                    field: 'details',
                    data: {
                      priceRange: rec.priceRange,
                      bestTime: rec.bestTime,
                      link: rec.link,
                    },
                  }) + '\n'
                )
              );
            }

            const images = await Promise.all(imageSearchPromises);
            images.forEach(({ index, imageUrl }) => {
              controller.enqueue(
                encoder.encode(
                  JSON.stringify({
                    type: 'field',
                    index,
                    field: 'image',
                    data: { imageUrl },
                  }) + '\n'
                )
              );
            });

            controller.enqueue(
              encoder.encode(JSON.stringify({ type: 'complete' }) + '\n')
            );

            controller.close();
          } catch (error) {
            console.error("Streaming error:", error);
            controller.error(error);
          }
        },
      });

      const requestEndTime = Date.now();
      const totalRequestDuration = requestEndTime - requestStartTime;

      console.log("\n" + "=".repeat(80));
      console.log("✅ REQUEST COMPLETED - PERFORMANCE SUMMARY");
      console.log("=".repeat(80));
      console.log(`⏱️  TOTAL REQUEST TIME: ${totalRequestDuration}ms (${(totalRequestDuration / 1000).toFixed(2)}s)`);
      console.log("=".repeat(80) + "\n");

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });

    } else {
      // 방법 1: 진짜 스트리밍 (partial-json 사용)
      console.log("🔧 Using REAL-TIME streaming with partial-json (Claude → instant display)");

      // 스트리밍 응답 생성
      console.log("📤 Starting real-time response streaming...");
      const encoder = new TextEncoder();

      const stream = new ReadableStream({
        async start(controller) {
          try {
            // 먼저 메타데이터 전송
            controller.enqueue(
              encoder.encode(
                JSON.stringify({
                  type: 'metadata',
                  searchAvailable,
                  searchContext: skipSearch ? undefined : searchContext,
                  hasMore: true,
                }) + '\n'
              )
            );

            // Claude 스트림 시작
            const anthropicStream = await anthropic.messages.stream({
              model: "claude-sonnet-4-5-20250929",
              max_tokens: 4096,
              temperature: 0.8,
              system: systemPrompt,
              messages: [
                {
                  role: "user",
                  content: userPrompt,
                },
              ],
            });

            let recommendationIndex = 0;
            const processedRecommendations = new Set<number>(); // 완전히 처리된 추천 인덱스
            let textBuffer = '';

            // 각 필드의 마지막 전송 상태 추적 (인덱스별)
            interface FieldState {
              title?: string;
              location?: string;
              description?: string;
              priceRange?: string;
              bestTime?: string;
              activities?: string;
              link?: string;
              imageSearchQuery?: string;
              imageStarted?: boolean;
            }
            const fieldStates: Map<number, FieldState> = new Map();

            console.log("🔄 Starting real-time JSON parsing with partial-json (character-by-character streaming)...");

            // Claude 스트림에서 실시간으로 텍스트 처리
            for await (const chunk of anthropicStream) {
              if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
                textBuffer += chunk.delta.text;

                // 코드 블록 제거 (```json ... ```)
                let cleanedBuffer = textBuffer;
                if (cleanedBuffer.includes('```json')) {
                  cleanedBuffer = cleanedBuffer.replace(/```json\s*/g, '');
                }
                if (cleanedBuffer.includes('```')) {
                  cleanedBuffer = cleanedBuffer.replace(/```/g, '');
                }
                cleanedBuffer = cleanedBuffer.trim();

                // partial-json으로 파싱 시도
                try {
                  const parsed = parsePartialJson(cleanedBuffer);

                  // 배열인지 확인
                  if (Array.isArray(parsed)) {
                    // 각 추천 항목을 처리
                    for (let i = 0; i < parsed.length; i++) {
                      const rec = parsed[i] as {
                        title?: string;
                        location?: string;
                        description?: string;
                        activities?: string[];
                        priceRange?: string;
                        bestTime?: string;
                        imageSearchQuery?: string;
                        link?: string;
                      };

                      // 이 추천이 이미 완전히 처리되었으면 스킵
                      if (processedRecommendations.has(i) || !rec) {
                        continue;
                      }

                      // 이전 상태 가져오기
                      const prevState = fieldStates.get(i) || {};
                      let updated = false;

                      // 3. Description - 문자 단위 스트리밍
                      if (rec.description && rec.description !== prevState.description) {
                        const prevDesc = prevState.description || '';

                        // 새로운 텍스트가 추가된 경우
                        if (rec.description.length > prevDesc.length &&
                            rec.description.startsWith(prevDesc)) {
                          const newChunk = rec.description.substring(prevDesc.length);

                          controller.enqueue(
                            encoder.encode(
                              JSON.stringify({
                                type: 'field_chunk',
                                index: i,
                                field: 'description',
                                data: {
                                  chunk: newChunk,
                                  isComplete: false,
                                },
                              }) + '\n'
                            )
                          );

                          prevState.description = rec.description;
                          updated = true;
                        }
                      }

                      // 4. PriceRange - 문자 단위 스트리밍
                      if (rec.priceRange && rec.priceRange !== prevState.priceRange) {
                        const prevPrice = prevState.priceRange || '';

                        if (rec.priceRange.length > prevPrice.length &&
                            rec.priceRange.startsWith(prevPrice)) {
                          const newChunk = rec.priceRange.substring(prevPrice.length);

                          controller.enqueue(
                            encoder.encode(
                              JSON.stringify({
                                type: 'field_chunk',
                                index: i,
                                field: 'priceRange',
                                data: {
                                  chunk: newChunk,
                                  isComplete: false,
                                },
                              }) + '\n'
                            )
                          );

                          prevState.priceRange = rec.priceRange;
                          updated = true;
                        }
                      }

                      // 5. BestTime - 문자 단위 스트리밍
                      if (rec.bestTime && rec.bestTime !== prevState.bestTime) {
                        const prevTime = prevState.bestTime || '';

                        if (rec.bestTime.length > prevTime.length &&
                            rec.bestTime.startsWith(prevTime)) {
                          const newChunk = rec.bestTime.substring(prevTime.length);

                          controller.enqueue(
                            encoder.encode(
                              JSON.stringify({
                                type: 'field_chunk',
                                index: i,
                                field: 'bestTime',
                                data: {
                                  chunk: newChunk,
                                  isComplete: false,
                                },
                              }) + '\n'
                            )
                          );

                          prevState.bestTime = rec.bestTime;
                          updated = true;
                        }
                      }

                      // 6. Link - 항상 Google 검색 링크로 생성 (장소명만 사용)
                      if (rec.link && !prevState.link) {
                        // 장소명으로만 Google 검색 링크 생성
                        const searchQuery = encodeURIComponent(rec.title);
                        const googleLink = `https://www.google.com/search?q=${searchQuery}`;

                        controller.enqueue(
                          encoder.encode(
                            JSON.stringify({
                              type: 'field',
                              index: i,
                              field: 'link',
                              data: {
                                link: googleLink,
                              },
                            }) + '\n'
                          )
                        );

                        prevState.link = googleLink;
                        updated = true;
                      }

                      // 상태 업데이트
                      if (updated) {
                        fieldStates.set(i, prevState);
                      }

                      // 모든 필드가 완성되었을 때 header, image, activities 전송
                      if (rec.title && rec.location && rec.description &&
                          rec.activities && rec.priceRange && rec.bestTime && rec.link &&
                          !processedRecommendations.has(i)) {

                        // 중복 체크
                        const isDuplicate = previousRecommendations.includes(rec.title);
                        if (!isDuplicate) {
                          // 1. Header 전송 (title + location) - 가장 먼저
                          if (!prevState.title) {
                            controller.enqueue(
                              encoder.encode(
                                JSON.stringify({
                                  type: 'field',
                                  index: i,
                                  field: 'header',
                                  data: {
                                    title: rec.title,
                                    location: rec.location,
                                  },
                                }) + '\n'
                              )
                            );
                            prevState.title = rec.title;
                            prevState.location = rec.location;
                            console.log(`✅ Recommendation ${i + 1} header: ${rec.title} (${rec.location})`);

                            // 2. Image - header 전송 직후 이미지 검색 시작
                            if ((rec.imageSearchQuery || rec.title) && !prevState.imageStarted) {
                              const searchQuery = rec.imageSearchQuery || rec.title || 'travel';
                              prevState.imageSearchQuery = searchQuery;
                              prevState.imageStarted = true;

                              // 비동기 이미지 검색
                              fetchImageFromMultipleSources(searchQuery).then((imageUrl) => {
                                controller.enqueue(
                                  encoder.encode(
                                    JSON.stringify({
                                      type: 'field',
                                      index: i,
                                      field: 'image',
                                      data: {
                                        imageUrl,
                                      },
                                    }) + '\n'
                                  )
                                );
                                console.log(`🖼️  Streamed image for recommendation ${i + 1}`);
                              }).catch((err) => {
                                console.error(`Failed to fetch image for recommendation ${i + 1}:`, err);
                              });
                            }
                          }

                          // 3. Activities 전송 (완전한 데이터, 마지막)
                          if (!prevState.activities) {
                            controller.enqueue(
                              encoder.encode(
                                JSON.stringify({
                                  type: 'field',
                                  index: i,
                                  field: 'activities',
                                  data: {
                                    activities: rec.activities,
                                  },
                                }) + '\n'
                              )
                            );
                            prevState.activities = JSON.stringify(rec.activities);
                            console.log(`✅ Recommendation ${i + 1} activities sent`);
                          }

                          fieldStates.set(i, prevState);
                        }

                        processedRecommendations.add(i);
                        recommendationIndex++;
                        console.log(`📦 Recommendation ${i + 1} completed: ${rec.title}`);
                      }
                    }
                  }
                } catch {
                  // 파싱 실패는 무시 (아직 완전하지 않은 JSON일 수 있음)
                }
              }
            }

            const claudeEndTime = Date.now();
            const claudeDuration = claudeEndTime - claudeStartTime;
            console.log(`⏱️  Claude AI streaming completed in ${claudeDuration}ms (${(claudeDuration / 1000).toFixed(2)}s)`);
            console.log(`📦 Total recommendations streamed: ${recommendationIndex}`);

            if (recommendationIndex < requestCount) {
              console.warn(`⚠️  Requested ${requestCount} but only got ${recommendationIndex} recommendations`);
            }

            // 모든 데이터 전송 완료 신호
            controller.enqueue(
              encoder.encode(
                JSON.stringify({
                  type: 'complete',
                }) + '\n'
              )
            );

            controller.close();
          } catch (error) {
            console.error("Real-time streaming error:", error);
            controller.error(error);
          }
        },
      });

      const requestEndTime = Date.now();
      const totalRequestDuration = requestEndTime - requestStartTime;

      console.log("\n" + "=".repeat(80));
      console.log("✅ REQUEST COMPLETED - PERFORMANCE SUMMARY");
      console.log("=".repeat(80));
      console.log(`⏱️  TOTAL REQUEST TIME: ${totalRequestDuration}ms (${(totalRequestDuration / 1000).toFixed(2)}s)`);
      console.log("=".repeat(80) + "\n");

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }
  } catch (error) {
    const requestEndTime = Date.now();
    const totalRequestDuration = requestEndTime - requestStartTime;
    console.error("\n" + "=".repeat(80));
    console.error("❌ REQUEST FAILED");
    console.error(`⏱️  Time until error: ${totalRequestDuration}ms (${(totalRequestDuration / 1000).toFixed(2)}s)`);
    console.error("=".repeat(80));
    console.error(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
