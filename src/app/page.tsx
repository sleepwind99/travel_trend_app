"use client";

import { useState, useCallback, useRef, useEffect } from "react";

type Recommendation = {
  title: string;
  location: string;
  description: string;
  activities: string[];
  priceRange: string;
  bestTime: string;
  imageUrl: string;
  link: string;
};

type PartialRecommendation = Partial<Recommendation> & {
  _loading?: boolean;
  _order?: number;
};

export default function Home() {
  const [destination, setDestination] = useState("");
  const [userId, setUserId] = useState("user_001");
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [recommendations, setRecommendations] = useState<PartialRecommendation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchAvailable, setSearchAvailable] = useState<boolean>(true);
  const [searchContext, setSearchContext] = useState<string>("");
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [currentSearchParams, setCurrentSearchParams] = useState<{destination: string; userId: string} | null>(null);

  const loadMoreTriggerRef = useRef<HTMLDivElement>(null);

  // 스트림에서 추천을 받아서 처리하는 함수
  const processStream = useCallback(async (response: Response, startIndex: number) => {
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error("Response body is null");
    }

    let buffer = "";
    let metadata: { searchAvailable?: boolean; searchContext?: string; hasMore?: boolean } = {};

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.trim()) continue;

        try {
          const message = JSON.parse(line);

          if (message.type === 'metadata') {
            metadata = message;
            setSearchAvailable(message.searchAvailable ?? true);
            setSearchContext(message.searchContext || "");
            setHasMore(message.hasMore ?? true);
          } else if (message.type === 'recommendation') {
            // 완성된 추천을 한 번에 표시
            const rec = message.data;
            const globalIndex = startIndex + message.index;

            setRecommendations(prev => {
              const updated = [...prev];
              if (updated[globalIndex]) {
                updated[globalIndex] = {
                  ...rec,
                  _loading: false,
                };
              }
              return updated;
            });

            console.log(`📦 Received recommendation ${message.index + 1}: ${rec.title}`);
          } else if (message.type === 'image_update') {
            // 이미지가 준비되면 업데이트
            const { index, data } = message;
            const globalIndex = startIndex + index;

            setRecommendations(prev => {
              const updated = [...prev];
              if (updated[globalIndex]) {
                updated[globalIndex] = {
                  ...updated[globalIndex],
                  imageUrl: data.imageUrl,
                };
              }
              return updated;
            });

            console.log(`🖼️ Image updated for recommendation ${index + 1}`);
          } else if (message.type === 'complete') {
            console.log("✅ Stream complete");
          }
        } catch (e) {
          console.error("Failed to parse message:", line, e);
        }
      }
    }

    return metadata;
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setHasMore(true);

    // 즉시 스켈레톤 카드 3개 표시
    const skeletons: PartialRecommendation[] = Array(3).fill(null).map((_, i) => ({
      _loading: true,
      _order: i,
    }));
    setRecommendations(skeletons);

    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          destination,
          userId,
          count: 3, // 최초 3개만 요청
          previousRecommendations: [], // 최초 검색이므로 빈 배열
        }),
      });

      if (!response.ok) {
        throw new Error("추천을 가져오는데 실패했습니다.");
      }

      // 스트림에서 데이터 받아서 즉시 표시
      await processStream(response, 0);

      setCurrentSearchParams({ destination, userId });
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || !currentSearchParams || recommendations.length >= 21) return;

    setLoadingMore(true);
    const startIndex = recommendations.length;

    // 이미 추천된 여행지 제목 목록 추출 (로딩 중이 아닌 것만)
    const previousTitles = recommendations
      .filter(rec => rec.title && !rec._loading)
      .map(rec => rec.title) as string[];

    // 즉시 스켈레톤 카드 3개 추가
    const skeletons: PartialRecommendation[] = Array(3).fill(null).map((_, i) => ({
      _loading: true,
      _order: startIndex + i,
    }));
    setRecommendations(prev => [...prev, ...skeletons]);

    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...currentSearchParams,
          count: 3, // 추가 3개씩 요청
          skipSearch: true, // 검색 건너뛰기
          searchContext, // 이전 검색 결과 재사용
          previousRecommendations: previousTitles, // 중복 방지를 위한 기존 추천 목록
        }),
      });

      if (!response.ok) {
        throw new Error("추가 추천을 가져오는데 실패했습니다.");
      }

      // 스트림에서 데이터 받아서 즉시 표시
      await processStream(response, startIndex);

    } catch (err) {
      console.error("Failed to load more:", err);
      // 에러 시 스켈레톤 제거
      setRecommendations(prev => prev.slice(0, startIndex));
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, currentSearchParams, searchContext, recommendations, processStream]);

  // Intersection Observer for automatic loading when scrolling down
  useEffect(() => {
    if (!loadMoreTriggerRef.current || !hasMore || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMore();
        }
      },
      {
        threshold: 0.5, // 50% 보일 때 트리거
        rootMargin: "100px", // 100px 전에 미리 로드
      }
    );

    observer.observe(loadMoreTriggerRef.current);

    return () => {
      if (loadMoreTriggerRef.current) {
        observer.unobserve(loadMoreTriggerRef.current);
      }
    };
  }, [hasMore, loadingMore, loadMore]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-400 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">AI 여행 플래너</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            당신만을 위한<br className="sm:hidden" /> 여행지를 찾아드려요
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            AI가 여러분의 취향과 특성에 맞는 완벽한 여행지를 추천해드립니다
          </p>
        </div>

        {/* Search Form */}
        <div className="max-w-3xl mx-auto mb-12">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="space-y-6">
                {/* Destination Input */}
                <div>
                  <label htmlFor="destination" className="block text-sm font-semibold text-gray-700 mb-2">
                    어디로 가고 싶으세요?
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      id="destination"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400 transition-all"
                      placeholder="예: 파리, 일본, 뉴욕"
                      required
                    />
                  </div>
                </div>

                {/* User Selection */}
                <div>
                  <label htmlFor="userId" className="block text-sm font-semibold text-gray-700 mb-2">
                    사용자 선택
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <select
                      id="userId"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition-all appearance-none bg-white cursor-pointer"
                    >
                      <option value="user_001">김민준 (남성, 20대) - 아웃도어 & 문화 활동</option>
                      <option value="user_002">박서연 (여성, 30대) - 웰빙 & 라이프스타일</option>
                      <option value="user_003">이준호 (남성, 40대) - 골프 & 비즈니스</option>
                    </select>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    💡 각 사용자의 최근 한 달간 거래 내역을 기반으로 맞춤형 여행지를 추천합니다
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-blue-600 disabled:from-gray-400 disabled:to-gray-300 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      AI가 분석중입니다...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      여행지 추천받기
                    </span>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-3xl mx-auto mb-8">
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="max-w-3xl mx-auto text-center py-12">
            <div className="inline-block">
              <svg className="animate-spin h-16 w-16 text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="mt-4 text-lg text-gray-600 font-medium">최고의 여행지를 찾고 있습니다...</p>
          </div>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">추천 여행지</h3>
              <p className="text-gray-600">AI가 선정한 당신을 위한 특별한 장소들</p>

              {/* Search Status Alert */}
              {!searchAvailable && (
                <div className="mt-4 max-w-2xl mx-auto">
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                          <span className="font-semibold">실시간 검색 사용 불가:</span> Tavily API를 사용할 수 없어 Claude AI의 학습된 지식만으로 추천했습니다. 최신 트렌드가 반영되지 않을 수 있습니다.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full animate-fade-in-up"
                  style={{
                    animationDelay: `${(index % 3) * 100}ms`,
                  }}
                >
                  {/* Image */}
                  <div className="relative h-48 sm:h-56 overflow-hidden flex-shrink-0">
                    {rec.imageUrl ? (
                      <>
                        <img
                          src={rec.imageUrl}
                          alt={rec.title || "여행지 이미지"}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                          onError={(e) => {
                            e.currentTarget.src = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800";
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      </>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse"></div>
                    )}
                    <div className="absolute top-3 right-3">
                      {rec.location ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-sm text-gray-900 shadow-sm">
                          <svg className="w-3 h-3 mr-1 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          {rec.location}
                        </span>
                      ) : (
                        <div className="h-6 w-24 bg-white/90 rounded-full animate-pulse"></div>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-grow">
                    {/* Title */}
                    {rec.title ? (
                      <h4 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                        {rec.title}
                      </h4>
                    ) : (
                      <div className="space-y-2 mb-3">
                        <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                      </div>
                    )}

                    {/* Description */}
                    <div className="mb-4 min-h-[120px]">
                      {rec.description ? (
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {rec.description}
                        </p>
                      ) : (
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse"></div>
                        </div>
                      )}
                    </div>

                    {/* Activities */}
                    <div className="mb-4">
                      <div className="flex items-center mb-2">
                        <svg className="w-4 h-4 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                          <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs font-semibold text-gray-700">추천 활동</span>
                      </div>
                      {rec.activities && rec.activities.length > 0 ? (
                        <ul className="space-y-1.5">
                          {rec.activities.slice(0, 3).map((activity, idx) => (
                            <li key={idx} className="text-xs text-gray-600 flex items-start">
                              <span className="text-blue-500 mr-2 mt-0.5">•</span>
                              <span className="line-clamp-1">{activity}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="space-y-1.5">
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                          <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse"></div>
                        </div>
                      )}
                    </div>

                    {/* Price and Time */}
                    <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-gray-50 rounded-xl">
                      <div>
                        <div className="flex items-center mb-1">
                          <svg className="w-4 h-4 mr-1 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs text-gray-500 font-medium">예상 비용</span>
                        </div>
                        {rec.priceRange ? (
                          <div className="text-xs font-semibold text-gray-900 space-y-0.5">
                            {rec.priceRange.split('/').map((item, idx) => (
                              <div key={idx}>{item.trim()}</div>
                            ))}
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-3 bg-gray-200 rounded w-4/5 animate-pulse"></div>
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center mb-1">
                          <svg className="w-4 h-4 mr-1 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs text-gray-500 font-medium">최적 시기</span>
                        </div>
                        {rec.bestTime ? (
                          <p className="text-xs font-semibold text-gray-900 line-clamp-2">{rec.bestTime}</p>
                        ) : (
                          <div className="space-y-1">
                            <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-3 bg-gray-200 rounded w-3/5 animate-pulse"></div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Link Button - 카드 하단에 고정 */}
                    {rec.link ? (
                      <a
                        href={rec.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-auto block w-full text-center bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold py-3 px-4 rounded-xl hover:from-blue-700 hover:to-blue-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                      >
                        자세히 보기
                        <svg className="inline-block w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </a>
                    ) : (
                      <div className="mt-auto w-full h-12 bg-gray-200 rounded-xl animate-pulse"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Trigger Section */}
            {hasMore && recommendations.length > 0 && recommendations.length < 21 && (
              <div
                ref={loadMoreTriggerRef}
                className="w-full py-12 flex flex-col items-center justify-center space-y-4"
              >
                {loadingMore ? (
                  // 로딩 중
                  <div className="flex flex-col items-center space-y-4 animate-fade-in">
                    <div className="relative">
                      <svg className="animate-spin h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full animate-ping"></div>
                      </div>
                    </div>
                    <p className="text-lg font-semibold text-blue-600 animate-pulse">
                      더 많은 여행지를 찾고 있습니다...
                    </p>
                    <p className="text-sm text-gray-500">
                      AI가 맞춤형 추천을 생성 중입니다
                    </p>
                  </div>
                ) : (
                  // 스크롤 유도 UI
                  <div className="flex flex-col items-center space-y-4 animate-bounce-slow">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-8 h-8 text-white animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                      </div>
                      <div className="absolute inset-0 w-16 h-16 bg-blue-400 rounded-full animate-ping opacity-20"></div>
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-lg font-bold text-gray-800">
                        더 많은 여행지를 확인해보세요!
                      </p>
                      <p className="text-sm text-gray-600">
                        스크롤을 계속 내리면 추가로 {Math.min(3, 21 - recommendations.length)}개의 여행지를 추천받을 수 있습니다
                      </p>
                      <div className="flex items-center justify-center space-x-1 text-xs text-gray-500">
                        <span>{recommendations.length}</span>
                        <span>/</span>
                        <span>21</span>
                        <span>개 추천 확인</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Max items reached message */}
            {recommendations.length >= 21 && (
              <div className="w-full py-12 flex flex-col items-center justify-center space-y-4 animate-fade-in">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="absolute -top-1 -right-1">
                    <span className="flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
                    </span>
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-xl font-bold text-gray-800">
                    모든 추천을 확인하셨습니다! 🎉
                  </p>
                  <p className="text-sm text-gray-600">
                    총 {recommendations.length}개의 맞춤형 여행지를 추천받으셨습니다
                  </p>
                  <div className="flex items-center justify-center space-x-2 pt-2">
                    <div className="w-full max-w-xs h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full animate-fade-in"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-lg font-bold">AI 여행 플래너</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Powered by Claude AI • 당신만을 위한 맞춤 여행 추천
            </p>
            <p className="text-gray-500 text-xs">
              © 2024 AI Travel Planner. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
