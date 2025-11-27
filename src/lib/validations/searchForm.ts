import { z } from "zod";

export const searchFormSchema = z.object({
  destination: z
    .string()
    .min(1, "여행지를 입력해주세요")
    .min(2, "최소 2자 이상 입력해주세요")
    .max(50, "50자 이하로 입력해주세요")
    .regex(/^[a-zA-Z가-힣\s]+$/, "한글 또는 영문만 입력 가능합니다"),
  userId: z.string().min(1, "사용자를 선택해주세요"),
});

export type SearchFormData = z.infer<typeof searchFormSchema>;
