import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import axios from "axios";
import { parse as parsePartialJson } from "partial-json";
import fs from "fs";
import path from "path";
import { generatePrompts } from "@/prompts/travelRecommendation";

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

// 검색 모드 설정: 'server' (기본) 또는 'claude_tools'
const SEARCH_MODE = process.env.SEARCH_MODE || 'server';
const SERPER_API_KEY = process.env.SERPER_API_KEY;

// 사용자 데이터 타입 정의
interface Transaction {
  date: string;
  category: string;
  merchant: string;
  amount: number;
  description: string;
}

interface UserData {
  id: string;
  name: string;
  gender: string;
  age: string;
  transactions: Transaction[];
}

interface UsersData {
  users: UserData[];
}

// 사용자 데이터 로드
function loadUserData(userId: string): UserData | null {
  try {
    const filePath = path.join(process.cwd(), 'data', 'users.json');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data: UsersData = JSON.parse(fileContent);

    const user = data.users.find(u => u.id === userId);
    if (!user) {
      console.error(`❌ User not found: ${userId}`);
      return null;
    }

    return user;
  } catch (error) {
    console.error("❌ Failed to load user data:", error);
    return null;
  }
}

// 거래 내역 분석하여 관심사 추출
function analyzeTransactions(transactions: Transaction[]): string {
  // 카테고리별 지출 집계
  const categorySpending: Record<string, number> = {};
  const categoryCount: Record<string, number> = {};

  transactions.forEach(t => {
    categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
    categoryCount[t.category] = (categoryCount[t.category] || 0) + 1;
  });

  // 지출액 기준 상위 카테고리 정렬
  const topCategories = Object.entries(categorySpending)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([category, amount]) => ({
      category,
      amount,
      count: categoryCount[category]
    }));

  // 분석 텍스트 생성
  const analysisLines: string[] = [
    "=== 사용자 소비 패턴 분석 ===",
    "",
    "주요 관심 분야 (지출액 기준):"
  ];

  topCategories.forEach((item, index) => {
    analysisLines.push(
      `${index + 1}. ${item.category}: ${item.count}회, ${item.amount.toLocaleString()}원`
    );
  });

  // 구체적인 상점/장소 언급
  analysisLines.push("");
  analysisLines.push("자주 방문하는 장소:");
  const merchantCounts: Record<string, number> = {};
  transactions.forEach(t => {
    merchantCounts[t.merchant] = (merchantCounts[t.merchant] || 0) + 1;
  });

  const topMerchants = Object.entries(merchantCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([merchant, count]) => `- ${merchant} (${count}회)`);

  analysisLines.push(...topMerchants);

  // 최근 구매 항목
  analysisLines.push("");
  analysisLines.push("최근 구매 항목:");
  transactions.slice(0, 5).forEach(t => {
    analysisLines.push(`- ${t.date}: ${t.description} (${t.merchant})`);
  });

  return analysisLines.join("\n");
}

// Serper API로 실시간 여행 트렌드 검색 (방법 1: 서버 검색)
async function searchTravelTrendsSerper(
  destination: string,
  user: UserData,
  interests: string,
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
    // 사용자의 관심사를 반영한 검색 쿼리 생성
    const topInterests = interests.split('\n')
      .filter(line => line.match(/^\d+\./))
      .slice(0, 3)
      .map(line => line.split(':')[0].replace(/^\d+\.\s*/, '').trim())
      .join(' ');

    // 최적화된 검색 쿼리 (2개)
    const searchQueries = [
      `${destination} 여행 추천 2025 최신 ${topInterests} ${user.age}`,
      `${destination} 인기 여행지 ${user.gender} ${topInterests}`,
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

// 구글 이미지 검색으로 정확한 이미지 가져오기
async function fetchImageFromMultipleSources(query: string): Promise<string> {
  // 1순위: Serper 구글 이미지 검색 (가장 정확함)
  if (SERPER_API_KEY) {
    try {
      console.log(`🔍 Searching Google Images via Serper for: ${query}`);

      const response = await axios.post(
        'https://google.serper.dev/images',
        {
          q: query,
          num: 1, // 첫 번째 결과만
        },
        {
          headers: {
            'X-API-KEY': SERPER_API_KEY,
            'Content-Type': 'application/json',
          },
          timeout: 5000,
        }
      );

      if (response.data.images && response.data.images.length > 0) {
        const imageUrl = response.data.images[0].imageUrl;
        console.log(`✅ Google Image found: ${imageUrl.substring(0, 80)}...`);
        return imageUrl;
      } else {
        console.warn(`⚠️  No Google Images found for: ${query}`);
      }
    } catch (error: unknown) {
      const err = error as { response?: { status?: number }; message?: string };
      console.error(`❌ Serper Image Search failed for "${query}":`, err?.message || error);
    }
  }

  // 2순위: Unsplash 폴백 (Serper 실패 시)
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  const unsplashUrl = `https://source.unsplash.com/1200x800/?${encodeURIComponent(query)}&sig=${timestamp}-${random}`;
  console.log(`⚠️  Falling back to Unsplash for: ${query}`);
  return unsplashUrl;
}

export async function POST(request: Request) {
  const requestStartTime = Date.now();

  try {
    const body = await request.json();
    const { destination, userId, count = 3, skipSearch = false, searchContext: providedSearchContext, previousRecommendations = [] } = body;

    if (!destination || !userId) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // 사용자 데이터 로드
    const userData = loadUserData(userId);
    if (!userData) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // 거래 내역 분석
    const transactionAnalysis = analyzeTransactions(userData.transactions);

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
      const searchResult = await searchTravelTrendsSerper(destination, userData, transactionAnalysis, currentDate);
      searchContext = searchResult.searchContext;
      searchAvailable = searchResult.searchAvailable;
    } else {
      // 방법 2는 아래에서 Claude Tool Use로 처리
      console.log("🔧 SEARCH_MODE: claude_tools (Claude가 직접 검색)");
      searchContext = "";
      searchAvailable = false; // Tool Use에서는 검색 결과를 프롬프트에 포함하지 않음
    }

    // 프롬프트 생성
    const { systemPrompt, userPrompt } = generatePrompts({
      destination,
      userData,
      transactionAnalysis,
      currentDate,
      currentSeason,
      requestCount,
      searchAvailable,
      searchContext,
      previousRecommendations
    });

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

                      // 모든 필드가 완성되었는지 확인
                      if (rec.title && rec.location && rec.description &&
                          rec.activities && rec.priceRange && rec.bestTime && rec.link &&
                          !processedRecommendations.has(i)) {

                        // 중복 체크
                        const isDuplicate = previousRecommendations.includes(rec.title);
                        if (!isDuplicate) {
                          // Google 검색 링크 생성
                          const searchQuery = encodeURIComponent(rec.title || '');
                          const googleLink = `https://www.google.com/search?q=${searchQuery}`;

                          // 이미지 검색 쿼리 준비
                          const imageSearchQuery = rec.imageSearchQuery || rec.title || 'travel';

                          // 이미지 URL 가져오기 (Unsplash는 즉시 반환)
                          const imageUrl = await fetchImageFromMultipleSources(imageSearchQuery);
                          console.log(`🖼️  Image URL generated for recommendation ${i + 1}: ${imageUrl}`);

                          // 완성된 추천을 이미지와 함께 전송
                          controller.enqueue(
                            encoder.encode(
                              JSON.stringify({
                                type: 'recommendation',
                                index: i,
                                data: {
                                  title: rec.title,
                                  location: rec.location,
                                  description: rec.description,
                                  activities: rec.activities,
                                  priceRange: rec.priceRange,
                                  bestTime: rec.bestTime,
                                  link: googleLink,
                                  imageUrl: imageUrl,
                                },
                              }) + '\n'
                            )
                          );

                          console.log(`✅ Recommendation ${i + 1} completed: ${rec.title}`);
                        }

                        processedRecommendations.add(i);
                        recommendationIndex++;
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
