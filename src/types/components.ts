import { RefObject } from "react";
import { UserData, PartialRecommendation, NewUser } from "./index";

// SearchSection 컴포넌트 Props (메인 클라이언트 컴포넌트)
export type SearchSectionProps = {
  initialUsers: UserData[];
};

// SearchForm 컴포넌트 Props
export type SearchFormProps = {
  destination: string;
  setDestination: (value: string) => void;
  userId: string;
  setUserId: (value: string) => void;
  users: UserData[];
  loading: boolean;
  modalLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onLoadUserData: () => void;
  onOpenAddUserModal: () => void;
};

// RecommendationCard 컴포넌트 Props
export type RecommendationCardProps = {
  recommendation: PartialRecommendation;
  index: number;
};

// RecommendationsGrid 컴포넌트 Props
export type RecommendationsGridProps = {
  recommendations: PartialRecommendation[];
  searchAvailable: boolean;
  hasMore: boolean;
  loadingMore: boolean;
  loadMoreTriggerRef: RefObject<HTMLDivElement | null>;
};

// UserInfoModal 컴포넌트 Props
export type UserInfoModalProps = {
  isOpen: boolean;
  userData: UserData | null;
  loading: boolean;
  onClose: () => void;
  onSave: () => void;
  onDelete: () => void;
  onUpdateUserData: (data: UserData) => void;
};

// AddUserModal 컴포넌트 Props
export type AddUserModalProps = {
  isOpen: boolean;
  newUser: NewUser;
  loading: boolean;
  onClose: () => void;
  onAdd: () => void;
  onUpdateNewUser: (user: NewUser) => void;
};
