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

// 사용자 데이터 조회 (GET)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    // users.json 파일 읽기
    const fileContent = fs.readFileSync(USERS_FILE_PATH, 'utf-8');
    const data: UsersData = JSON.parse(fileContent);

    // 사용자 찾기
    const user = data.users.find(u => u.id === userId);

    if (!user) {
      return NextResponse.json(
        { message: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error reading user data:", error);
    return NextResponse.json(
      { message: "사용자 데이터를 읽는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 사용자 데이터 업데이트 (PUT)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const updatedUser: UserData = await request.json();

    // users.json 파일 읽기
    const fileContent = fs.readFileSync(USERS_FILE_PATH, 'utf-8');
    const data: UsersData = JSON.parse(fileContent);

    // 사용자 인덱스 찾기
    const userIndex = data.users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return NextResponse.json(
        { message: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 사용자 데이터 업데이트 (ID는 변경 불가)
    data.users[userIndex] = {
      ...updatedUser,
      id: userId, // ID는 변경되지 않도록 보장
    };

    // 파일에 다시 쓰기
    fs.writeFileSync(
      USERS_FILE_PATH,
      JSON.stringify(data, null, 2),
      'utf-8'
    );

    return NextResponse.json({
      message: "사용자 정보가 성공적으로 업데이트되었습니다.",
      user: data.users[userIndex]
    });
  } catch (error) {
    console.error("Error updating user data:", error);
    return NextResponse.json(
      { message: "사용자 데이터를 업데이트하는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 사용자 삭제 (DELETE)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    // users.json 파일 읽기
    const fileContent = fs.readFileSync(USERS_FILE_PATH, 'utf-8');
    const data: UsersData = JSON.parse(fileContent);

    // 사용자 찾기
    const userIndex = data.users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return NextResponse.json(
        { message: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 사용자 삭제
    const deletedUser = data.users[userIndex];
    data.users.splice(userIndex, 1);

    // 파일에 다시 쓰기
    fs.writeFileSync(
      USERS_FILE_PATH,
      JSON.stringify(data, null, 2),
      'utf-8'
    );

    return NextResponse.json({
      message: "사용자가 성공적으로 삭제되었습니다.",
      deletedUser
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { message: "사용자를 삭제하는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
