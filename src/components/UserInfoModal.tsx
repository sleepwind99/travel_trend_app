"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Transaction } from "@/types";
import { UserInfoModalProps } from "@/types/components";

export default function UserInfoModal({
  isOpen,
  userData,
  loading,
  onClose,
  onSave,
  onDelete,
  onUpdateUserData,
}: UserInfoModalProps) {
  if (!isOpen || !userData) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-100 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col transition-colors"
          >
        {/* 모달 헤더 */}
        <div className="bg-linear-to-r from-blue-600 to-blue-500 dark:from-blue-700 dark:to-blue-600 px-6 py-4 flex items-center justify-between transition-colors">
          <div className="flex items-center space-x-3">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <h3 className="text-xl font-bold text-white">사용자 정보 관리</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 모달 본문 */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* 기본 정보 */}
          <div className="mb-6">
            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              기본 정보
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">이름</label>
                <input
                  type="text"
                  value={userData.name}
                  onChange={(e) => onUpdateUserData({ ...userData, name: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 font-medium transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">성별</label>
                <select
                  value={userData.gender}
                  onChange={(e) => onUpdateUserData({ ...userData, gender: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 font-medium transition-colors"
                >
                  <option value="male">남성</option>
                  <option value="female">여성</option>
                  <option value="other">기타</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">연령대</label>
                <select
                  value={userData.age}
                  onChange={(e) => onUpdateUserData({ ...userData, age: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 font-medium transition-colors"
                >
                  <option value="10s">10대</option>
                  <option value="20s">20대</option>
                  <option value="30s">30대</option>
                  <option value="40s">40대</option>
                  <option value="50s+">50대 이상</option>
                </select>
              </div>
            </div>
          </div>

          {/* 거래 내역 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-gray-900 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                거래 내역 ({userData.transactions.length}개)
              </h4>
              <motion.button
                onClick={() => {
                  const newTransaction: Transaction = {
                    date: new Date().toISOString().split('T')[0],
                    category: "기타",
                    merchant: "",
                    amount: 0,
                    description: ""
                  };
                  onUpdateUserData({
                    ...userData,
                    transactions: [newTransaction, ...userData.transactions]
                  });
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center cursor-pointer"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                거래 추가
              </motion.button>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {userData.transactions.map((transaction, index) => (
                <div key={index} className="bg-white rounded-lg p-4 border-2 border-gray-300">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-900 mb-1">날짜</label>
                      <input
                        type="date"
                        value={transaction.date}
                        onChange={(e) => {
                          const newTransactions = [...userData.transactions];
                          newTransactions[index].date = e.target.value;
                          onUpdateUserData({ ...userData, transactions: newTransactions });
                        }}
                        className="w-full px-2 py-1.5 text-sm border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-900 mb-1">카테고리</label>
                      <input
                        type="text"
                        value={transaction.category}
                        onChange={(e) => {
                          const newTransactions = [...userData.transactions];
                          newTransactions[index].category = e.target.value;
                          onUpdateUserData({ ...userData, transactions: newTransactions });
                        }}
                        className="w-full px-2 py-1.5 text-sm border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-900 mb-1">상점</label>
                      <input
                        type="text"
                        value={transaction.merchant}
                        onChange={(e) => {
                          const newTransactions = [...userData.transactions];
                          newTransactions[index].merchant = e.target.value;
                          onUpdateUserData({ ...userData, transactions: newTransactions });
                        }}
                        className="w-full px-2 py-1.5 text-sm border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-900 mb-1">금액</label>
                      <input
                        type="number"
                        value={transaction.amount}
                        onChange={(e) => {
                          const newTransactions = [...userData.transactions];
                          newTransactions[index].amount = parseInt(e.target.value) || 0;
                          onUpdateUserData({ ...userData, transactions: newTransactions });
                        }}
                        className="w-full px-2 py-1.5 text-sm border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-900 mb-1">설명</label>
                      <div className="flex gap-1">
                        <input
                          type="text"
                          value={transaction.description}
                          onChange={(e) => {
                            const newTransactions = [...userData.transactions];
                            newTransactions[index].description = e.target.value;
                            onUpdateUserData({ ...userData, transactions: newTransactions });
                          }}
                          className="flex-1 px-2 py-1.5 text-sm border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"
                        />
                        <button
                          onClick={() => {
                            const newTransactions = userData.transactions.filter((_, i) => i !== index);
                            onUpdateUserData({ ...userData, transactions: newTransactions });
                          }}
                          className="px-2 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded transition-colors cursor-pointer"
                          title="삭제"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 모달 푸터 */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
          <motion.button
            onClick={onDelete}
            disabled={loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors flex items-center disabled:cursor-not-allowed cursor-pointer"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            사용자 삭제
          </motion.button>
          <div className="flex space-x-3">
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors cursor-pointer"
            >
              취소
            </motion.button>
            <motion.button
              onClick={onSave}
              disabled={loading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2.5 bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-gray-400 disabled:to-gray-300 text-white font-semibold rounded-lg transition-colors flex items-center disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  저장 중...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  저장
                </>
              )}
            </motion.button>
          </div>
        </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
