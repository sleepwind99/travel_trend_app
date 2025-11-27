"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
} from "react-share";

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
      } catch {
        // User cancelled or error occurred
        console.log("Share cancelled");
      }
    } else {
      toast.error("이 브라우저는 공유 기능을 지원하지 않습니다.");
    }
  };

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="p-2 bg-white/90 hover:bg-white rounded-full shadow-md hover:shadow-lg transition-all"
        title="공유하기"
      >
        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Share Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl z-50 overflow-hidden border border-gray-100"
            >
              <div className="p-3">
                <p className="text-sm font-bold text-gray-900 mb-3 px-2">공유하기</p>

                <div className="space-y-2">
                  {/* Copy Link */}
                  <motion.button
                    onClick={copyToClipboard}
                    whileHover={{ scale: 1.02, backgroundColor: "#f3f4f6" }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center px-3 py-2.5 rounded-lg transition-colors text-left"
                  >
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-700">링크 복사</span>
                  </motion.button>

                  {/* Native Share (mobile) */}
                  {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
                    <motion.button
                      onClick={shareNative}
                      whileHover={{ scale: 1.02, backgroundColor: "#f3f4f6" }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center px-3 py-2.5 rounded-lg transition-colors text-left"
                    >
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                          />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-700">기기에서 공유</span>
                    </motion.button>
                  )}

                  {/* Social Media Shares */}
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 mb-2 px-2">SNS 공유</p>
                    <div className="flex justify-around py-2">
                      <TwitterShareButton url={shareUrl} title={shareText}>
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <TwitterIcon size={40} round />
                        </motion.div>
                      </TwitterShareButton>
                      <FacebookShareButton url={shareUrl} hashtag="#여행추천">
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <FacebookIcon size={40} round />
                        </motion.div>
                      </FacebookShareButton>
                      <WhatsappShareButton url={shareUrl} title={shareText}>
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <WhatsappIcon size={40} round />
                        </motion.div>
                      </WhatsappShareButton>
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
