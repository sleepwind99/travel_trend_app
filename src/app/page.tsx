import { getUsersFromFile } from "@/lib/server-actions";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchSection from "@/components/SearchSection";

// 서버 컴포넌트 (SSR)
export default async function Home() {
  // 서버에서 초기 사용자 목록 fetch
  const initialUsers = await getUsersFromFile();

  return (
    <main className="min-h-screen bg-linear-to-b from-blue-50 via-white to-blue-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 클라이언트 컴포넌트에 초기 데이터 전달 */}
        <SearchSection initialUsers={initialUsers} />
      </div>

      <Footer />
    </main>
  );
}
