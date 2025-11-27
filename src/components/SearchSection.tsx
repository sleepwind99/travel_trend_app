"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { PartialRecommendation, UserData, NewUser } from "@/types";
import { SearchSectionProps } from "@/types/components";
import SearchForm from "./SearchForm";
import RecommendationsGrid from "./RecommendationsGrid";

// 모달 컴포넌트를 동적으로 import (코드 스플리팅)
// 모달이 열릴 때만 로드되어 초기 번들 크기 감소
const UserInfoModal = dynamic(() => import("./UserInfoModal"), {
  ssr: false, // 클라이언트에서만 필요
  loading: () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
      </div>
    </div>
  ),
});

const AddUserModal = dynamic(() => import("./AddUserModal"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8">
        <div className="animate-spin h-8 w-8 border-4 border-green-600 border-t-transparent rounded-full mx-auto"></div>
      </div>
    </div>
  ),
});

export default function SearchSection({ initialUsers }: SearchSectionProps) {
  // 검색 관련 상태
  const [destination, setDestination] = useState("");
  const [userId, setUserId] = useState(initialUsers[0]?.id || "user_001");
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [recommendations, setRecommendations] = useState<PartialRecommendation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchAvailable, setSearchAvailable] = useState<boolean>(true);
  const [searchContext, setSearchContext] = useState<string>("");
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [currentSearchParams, setCurrentSearchParams] = useState<{destination: string; userId: string} | null>(null);

  // 모달 관련 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  // 사용자 목록 관리
  const [users, setUsers] = useState<UserData[]>(initialUsers);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUser, setNewUser] = useState<NewUser>({
    name: "",
    gender: "male",
    age: "20s"
  });

  const loadMoreTriggerRef = useRef<HTMLDivElement>(null);

  // 사용자 목록 로드
  const loadUsersList = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

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
          } else if (message.type === 'image_update') {
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
          } else if (message.type === 'complete') {
          }
        } catch (e) {
          console.error("Failed to parse message:", line, e);
        }
      }
    }

    return metadata;
  }, []);

  // 사용자 데이터 로드 함수
  const loadUserData = useCallback(async () => {
    setModalLoading(true);
    try {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) {
        throw new Error("사용자 정보를 가져오는데 실패했습니다.");
      }
      const data = await response.json();
      setUserData(data);
      setIsModalOpen(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
    } finally {
      setModalLoading(false);
    }
  }, [userId]);

  // 사용자 데이터 저장 함수
  const saveUserData = useCallback(async () => {
    if (!userData) return;

    setModalLoading(true);
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error("사용자 정보 저장에 실패했습니다.");
      }

      alert("사용자 정보가 성공적으로 저장되었습니다!");
      setIsModalOpen(false);
      loadUsersList();
    } catch (err) {
      alert(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
    } finally {
      setModalLoading(false);
    }
  }, [userData, userId]);

  // 사용자 추가 함수
  const addNewUser = useCallback(async () => {
    if (!newUser.name.trim()) {
      alert("이름을 입력해주세요.");
      return;
    }

    setModalLoading(true);
    try {
      const response = await fetch('/api/users', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newUser,
          transactions: []
        }),
      });

      if (!response.ok) {
        throw new Error("사용자 추가에 실패했습니다.");
      }

      const result = await response.json();
      alert("새 사용자가 성공적으로 추가되었습니다!");
      setIsAddUserModalOpen(false);
      setNewUser({ name: "", gender: "male", age: "20s" });
      loadUsersList();
      setUserId(result.user.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
    } finally {
      setModalLoading(false);
    }
  }, [newUser]);

  // 사용자 삭제 함수
  const deleteUser = useCallback(async () => {
    if (!confirm(`정말로 "${userData?.name}" 사용자를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }

    setModalLoading(true);
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("사용자 삭제에 실패했습니다.");
      }

      alert("사용자가 성공적으로 삭제되었습니다!");
      setIsModalOpen(false);
      loadUsersList();

      const remainingUsers = users.filter(u => u.id !== userId);
      if (remainingUsers.length > 0) {
        setUserId(remainingUsers[0].id);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
    } finally {
      setModalLoading(false);
    }
  }, [userId, userData, users]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setHasMore(true);

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
          count: 3,
          previousRecommendations: [],
        }),
      });

      if (!response.ok) {
        throw new Error("추천을 가져오는데 실패했습니다.");
      }

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

    const previousTitles = recommendations
      .filter(rec => rec.title && !rec._loading)
      .map(rec => rec.title) as string[];

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
          count: 3,
          skipSearch: true,
          searchContext,
          previousRecommendations: previousTitles,
        }),
      });

      if (!response.ok) {
        throw new Error("추가 추천을 가져오는데 실패했습니다.");
      }

      await processStream(response, startIndex);

    } catch (err) {
      console.error("Failed to load more:", err);
      setRecommendations(prev => prev.slice(0, startIndex));
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, currentSearchParams, searchContext, recommendations, processStream]);

  // Intersection Observer for automatic loading
  useEffect(() => {
    if (!loadMoreTriggerRef.current || !hasMore || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMore();
        }
      },
      {
        threshold: 0.5,
        rootMargin: "100px",
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
    <>
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
      <SearchForm
        destination={destination}
        setDestination={setDestination}
        userId={userId}
        setUserId={setUserId}
        users={users}
        loading={loading}
        modalLoading={modalLoading}
        onSubmit={handleSubmit}
        onLoadUserData={loadUserData}
        onOpenAddUserModal={() => setIsAddUserModalOpen(true)}
      />

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

      {/* Recommendations */}
      <RecommendationsGrid
        recommendations={recommendations}
        searchAvailable={searchAvailable}
        hasMore={hasMore}
        loadingMore={loadingMore}
        loadMoreTriggerRef={loadMoreTriggerRef}
      />

      {/* User Info Modal */}
      <UserInfoModal
        isOpen={isModalOpen}
        userData={userData}
        loading={modalLoading}
        onClose={() => setIsModalOpen(false)}
        onSave={saveUserData}
        onDelete={deleteUser}
        onUpdateUserData={setUserData}
      />

      {/* Add User Modal */}
      <AddUserModal
        isOpen={isAddUserModalOpen}
        newUser={newUser}
        loading={modalLoading}
        onClose={() => {
          setIsAddUserModalOpen(false);
          setNewUser({ name: "", gender: "male", age: "20s" });
        }}
        onAdd={addNewUser}
        onUpdateNewUser={setNewUser}
      />
    </>
  );
}
