"use client";

import { memo } from "react";
import Image from "next/image";
import { RecommendationCardProps } from "@/types/components";

function RecommendationCard({ recommendation: rec, index }: RecommendationCardProps) {
  return (
    <div
      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full animate-fade-in-up"
      style={{
        animationDelay: `${(index % 3) * 100}ms`,
      }}
    >
      {/* Image - Next.js Image 최적화 */}
      <div className="relative h-48 sm:h-56 overflow-hidden flex-shrink-0">
        {rec.imageUrl ? (
          <>
            <Image
              src={rec.imageUrl}
              alt={rec.title || "여행지 이미지"}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 hover:scale-110"
              loading="lazy"
              quality={85}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwABmQ/9k="
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
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
  );
}

// React.memo로 성능 최적화 - props가 변경되지 않으면 리렌더링 방지
export default memo(RecommendationCard);
