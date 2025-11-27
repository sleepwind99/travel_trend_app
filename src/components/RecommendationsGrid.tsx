"use client";

import { RecommendationsGridProps } from "@/types/components";
import RecommendationCard from "./RecommendationCard";

export default function RecommendationsGrid({
  recommendations,
  searchAvailable,
  hasMore,
  loadingMore,
  loadMoreTriggerRef,
}: RecommendationsGridProps) {
  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">추천 여행지</h3>
        <p className="text-gray-600 dark:text-gray-300">AI가 선정한 당신을 위한 특별한 장소들</p>

        {/* Search Status Alert */}
        {!searchAvailable && (
          <div className="mt-4 max-w-2xl mx-auto">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
              <div className="flex items-start">
                <div className="shrink-0">
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
          <RecommendationCard key={index} recommendation={rec} index={index} />
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
                <div className="w-16 h-16 bg-linear-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
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
            <div className="w-16 h-16 bg-linear-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
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
                <div className="h-full bg-linear-to-r from-blue-500 to-green-500 rounded-full animate-fade-in"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
