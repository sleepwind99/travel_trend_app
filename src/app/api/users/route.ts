import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

interface Transaction {
  date: string;
  category: string;
  merchant: string;
  amount: number;
  description: string;
}

interface UserData {
  id: string;
  name: string;
  gender: string;
  age: string;
  transactions: Transaction[];
}

interface UsersData {
  users: UserData[];
}

const USERS_FILE_PATH = path.join(process.cwd(), 'data', 'users.json');

// 모든 사용자 조회 (GET)
export async function GET() {
  try {
    const fileContent = fs.readFileSync(USERS_FILE_PATH, 'utf-8');
    const data: UsersData = JSON.parse(fileContent);
    return NextResponse.json(data.users);
  } catch (error) {
    console.error("Error reading users data:", error);
    return NextResponse.json(
      { message: "사용자 데이터를 읽는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 새 사용자 생성 (POST)
export async function POST(request: Request) {
  try {
    const newUser: Omit<UserData, 'id'> = await request.json();

    // users.json 파일 읽기
    const fileContent = fs.readFileSync(USERS_FILE_PATH, 'utf-8');
    const data: UsersData = JSON.parse(fileContent);

    // 새 사용자 ID 생성 (user_XXX 형식)
    const maxId = data.users.reduce((max, user) => {
      const num = parseInt(user.id.replace('user_', ''));
      return num > max ? num : max;
    }, 0);
    const newId = `user_${String(maxId + 1).padStart(3, '0')}`;

    // 새 사용자 객체 생성
    const userToAdd: UserData = {
      id: newId,
      ...newUser,
      transactions: newUser.transactions || []
    };

    // 사용자 추가
    data.users.push(userToAdd);

    // 파일에 저장
    fs.writeFileSync(
      USERS_FILE_PATH,
      JSON.stringify(data, null, 2),
      'utf-8'
    );

    return NextResponse.json({
      message: "새 사용자가 성공적으로 생성되었습니다.",
      user: userToAdd
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { message: "사용자를 생성하는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
