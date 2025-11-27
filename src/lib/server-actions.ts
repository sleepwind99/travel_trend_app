import { UserData } from "@/types";
import fs from "fs";
import path from "path";

/**
 * 서버 사이드에서 사용자 목록을 가져옵니다.
 * 이 함수는 서버 컴포넌트에서만 사용할 수 있습니다.
 */
export async function getUsersFromFile(): Promise<UserData[]> {
  try {
    const filePath = path.join(process.cwd(), "data", "users.json");
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(fileContent);
    return data.users || [];
  } catch (error) {
    console.error("Failed to load users from file:", error);
    return [];
  }
}

/**
 * 서버 사이드에서 특정 사용자 정보를 가져옵니다.
 */
export async function getUserById(userId: string): Promise<UserData | null> {
  try {
    const users = await getUsersFromFile();
    return users.find((user) => user.id === userId) || null;
  } catch (error) {
    console.error("Failed to get user by id:", error);
    return null;
  }
}
