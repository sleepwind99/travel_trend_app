"use client";

import { memo } from "react";
import { SearchFormProps } from "@/types/components";

function SearchForm({
  destination,
  setDestination,
  userId,
  setUserId,
  users,
  loading,
  modalLoading,
  onSubmit,
  onLoadUserData,
  onOpenAddUserModal,
}: SearchFormProps) {
  return (
    <div className="max-w-3xl mx-auto mb-12">
      <form onSubmit={onSubmit} className="bg-white rounded-2xl shadow-xl overflow-hidden">
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
              <div className="flex gap-2">
                {/* 사용자 정보 버튼 */}
                <button
                  type="button"
                  onClick={onLoadUserData}
                  disabled={modalLoading}
                  className="shrink-0 w-12 h-14 bg-linear-to-br from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-gray-400 disabled:to-gray-300 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center group disabled:cursor-not-allowed"
                  title="사용자 정보 조회/수정"
                >
                  {modalLoading ? (
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                    </svg>
                  )}
                </button>

                {/* 사용자 선택 select */}
                <div className="relative flex-1">
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
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.gender === 'male' ? '남성' : user.gender === 'female' ? '여성' : '기타'}, {user.age})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 사용자 추가 버튼 */}
                <button
                  type="button"
                  onClick={onOpenAddUserModal}
                  className="shrink-0 w-12 h-14 bg-linear-to-br from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center group"
                  title="새 사용자 추가"
                >
                  <svg className="h-6 w-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                💡 각 사용자의 최근 한 달간 거래 내역을 기반으로 맞춤형 여행지를 추천합니다
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-linear-to-r from-blue-600 to-blue-500 text-white font-bold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-blue-600 disabled:from-gray-400 disabled:to-gray-300 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:cursor-not-allowed"
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
  );
}

// React.memo로 성능 최적화
export default memo(SearchForm);
