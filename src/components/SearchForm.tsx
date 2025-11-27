"use client";

import { memo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SearchFormProps } from "@/types/components";
import { searchFormSchema, SearchFormData } from "@/lib/validations/searchForm";

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
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    trigger,
  } = useForm<SearchFormData>({
    resolver: zodResolver(searchFormSchema),
    mode: "onChange",
    defaultValues: {
      destination,
      userId,
    },
  });

  // Sync external state with form state
  useEffect(() => {
    setValue("destination", destination);
    trigger("destination");
  }, [destination, setValue, trigger]);

  useEffect(() => {
    setValue("userId", userId);
  }, [userId, setValue]);

  const handleFormSubmit = handleSubmit(() => {
    // Create a synthetic event for compatibility with parent
    const syntheticEvent = {
      preventDefault: () => {},
    } as React.FormEvent;
    onSubmit(syntheticEvent);
  });

  return (
    <motion.div
      className="max-w-3xl mx-auto mb-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <form onSubmit={handleFormSubmit} className="bg-white rounded-2xl shadow-xl overflow-hidden">
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
                  {...register("destination")}
                  value={destination}
                  onChange={(e) => {
                    setDestination(e.target.value);
                    setValue("destination", e.target.value);
                    trigger("destination");
                  }}
                  className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:ring-2 text-gray-900 placeholder-gray-400 transition-all ${
                    errors.destination
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-200 focus:ring-blue-500 focus:border-transparent"
                  }`}
                  placeholder="예: 파리, 일본, 뉴욕"
                />
                {isValid && destination && !errors.destination && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none"
                  >
                    <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </motion.div>
                )}
              </div>
              <AnimatePresence mode="wait">
                {errors.destination && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="mt-2 text-sm text-red-600 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {errors.destination.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* User Selection */}
            <div>
              <label htmlFor="userId" className="block text-sm font-semibold text-gray-700 mb-2">
                사용자 선택
              </label>
              <div className="flex gap-2">
                {/* 사용자 정보 버튼 */}
                <motion.button
                  type="button"
                  onClick={onLoadUserData}
                  disabled={modalLoading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
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
                </motion.button>

                {/* 사용자 선택 select */}
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <select
                    id="userId"
                    {...register("userId")}
                    value={userId}
                    onChange={(e) => {
                      setUserId(e.target.value);
                      setValue("userId", e.target.value);
                    }}
                    className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:ring-2 text-gray-900 transition-all appearance-none bg-white cursor-pointer ${
                      errors.userId
                        ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-200 focus:ring-blue-500 focus:border-transparent"
                    }`}
                  >
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.gender === 'male' ? '남성' : user.gender === 'female' ? '여성' : '기타'}, {user.age})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 사용자 추가 버튼 */}
                <motion.button
                  type="button"
                  onClick={onOpenAddUserModal}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="shrink-0 w-12 h-14 bg-linear-to-br from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center group"
                  title="새 사용자 추가"
                >
                  <svg className="h-6 w-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </motion.button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                💡 각 사용자의 최근 한 달간 거래 내역을 기반으로 맞춤형 여행지를 추천합니다
              </p>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-linear-to-r from-blue-600 to-blue-500 text-white font-bold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-blue-600 disabled:from-gray-400 disabled:to-gray-300 transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
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
            </motion.button>
          </div>
        </div>
      </form>
    </motion.div>
  );
}

// React.memo로 성능 최적화
export default memo(SearchForm);
