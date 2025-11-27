"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface ShareButtonProps {
  title: string;
  description?: string;
  url?: string;
}

export default function ShareButton({ title, description, url }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const shareText = description ? `${title}\n\n${description}` : title;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`${title}\n${shareUrl}`);
      toast.success("링크가 클립보드에 복사되었습니다!");
      setIsOpen(false);
    } catch {
      toast.error("복사에 실패했습니다.");
    }
  };

  const shareNative = async () => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title,
          text: shareText,
          url: shareUrl,
        });
        setIsOpen(false);
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.log("Share cancelled");
        }
      }
    } else {
      toast.error("이 브라우저는 공유 기능을 지원하지 않습니다.");
    }
  };

  // 통합된 공유 함수 - 모든 SNS를 링크 복사로 처리
  const handleShare = async (platform: string) => {
    try {
      const fullText = `${title}\n\n${shareUrl}`;
      await navigator.clipboard.writeText(fullText);

      const messages: Record<string, string> = {
        twitter: "링크가 복사되었습니다! X(Twitter)에서 붙여넣기 해주세요.",
        facebook: "링크가 복사되었습니다! Facebook에서 붙여넣기 해주세요.",
        kakao: "링크가 복사되었습니다! 카카오톡에서 붙여넣기 해주세요.",
        instagram: "링크가 복사되었습니다! Instagram에서 붙여넣기 해주세요.",
      };

      toast.success(messages[platform] || "링크가 복사되었습니다!");
      setIsOpen(false);
    } catch {
      toast.error("복사에 실패했습니다.");
    }
  };

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="p-2 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 rounded-full shadow-md hover:shadow-lg transition-all cursor-pointer"
        title="공유하기"
      >
        <svg className="w-5 h-5 text-gray-700 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
          />
        </svg>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9998] cursor-default"
              onClick={() => setIsOpen(false)}
            />

            {/* Share Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-2xl z-[9999] overflow-hidden border border-gray-100 dark:border-gray-700 transition-colors"
            >
              <div className="p-3">
                <p className="text-sm font-bold text-gray-900 dark:text-white mb-3 px-2">공유하기</p>

                <div className="space-y-2">
                  {/* Copy Link */}
                  <motion.button
                    onClick={copyToClipboard}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left cursor-pointer"
                  >
                    <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">링크 복사</span>
                  </motion.button>

                  {/* Native Share (mobile) */}
                  {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
                    <motion.button
                      onClick={shareNative}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left cursor-pointer"
                    >
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                          />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">기기에서 공유</span>
                    </motion.button>
                  )}

                  {/* Social Media Shares */}
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 px-2">SNS 공유</p>
                    <div className="grid grid-cols-4 gap-2 py-2">
                      {/* X (Twitter) */}
                      <motion.button
                        onClick={() => handleShare('twitter')}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="X (Twitter)"
                        className="focus:outline-none flex flex-col items-center cursor-pointer"
                      >
                        <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center mb-1">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                          </svg>
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-400">Twitter</span>
                      </motion.button>

                      {/* KakaoTalk */}
                      <motion.button
                        onClick={() => handleShare('kakao')}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="카카오톡"
                        className="focus:outline-none flex flex-col items-center cursor-pointer"
                      >
                        <div className="w-10 h-10 bg-[#FEE500] rounded-full flex items-center justify-center mb-1">
                          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#3C1E1E">
                            <path d="M12 3C6.48 3 2 6.58 2 11c0 2.89 1.97 5.43 4.92 6.88-.1.43-.65 2.83-.75 3.28-.11.58.21.57.44.41.18-.12 2.87-1.93 3.32-2.24.52.07 1.05.11 1.59.11 5.52 0 10-3.58 10-8S17.52 3 12 3zm-1.5 11.5h-1v-4h-1.5v-1h4v1h-1.5v4zm3.5 0h-1v-5h1v5zm3.5 0h-1l-1.5-2.5v2.5h-1v-5h1l1.5 2.5V9.5h1v5z"/>
                          </svg>
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-400">카카오톡</span>
                      </motion.button>

                      {/* Facebook */}
                      <motion.button
                        onClick={() => handleShare('facebook')}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="Facebook"
                        className="focus:outline-none flex flex-col items-center cursor-pointer"
                      >
                        <div className="w-10 h-10 bg-[#1877F2] rounded-full flex items-center justify-center mb-1">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-400">Facebook</span>
                      </motion.button>

                      {/* Instagram */}
                      <motion.button
                        onClick={() => handleShare('instagram')}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="Instagram"
                        className="focus:outline-none flex flex-col items-center cursor-pointer"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 rounded-full flex items-center justify-center mb-1">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                          </svg>
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-400">Instagram</span>
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
