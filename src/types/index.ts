// ============================================
// 추천 관련 타입
// ============================================
export type Recommendation = {
  title: string;
  location: string;
  description: string;
  activities: string[];
  priceRange: string;
  bestTime: string;
  imageUrl: string;
  link: string;
};

export type PartialRecommendation = Partial<Recommendation> & {
  _loading?: boolean;
  _order?: number;
};

// ============================================
// 사용자 관련 타입
// ============================================
export type Transaction = {
  date: string;
  category: string;
  merchant: string;
  amount: number;
  description: string;
};

export type UserData = {
  id: string;
  name: string;
  gender: string;
  age: string;
  transactions: Transaction[];
};

export type NewUser = {
  name: string;
  gender: string;
  age: string;
};

// ============================================
// 컴포넌트 Props 타입 (재export)
// ============================================
export type {
  SearchSectionProps,
  SearchFormProps,
  RecommendationCardProps,
  RecommendationsGridProps,
  UserInfoModalProps,
  AddUserModalProps,
} from "./components";
