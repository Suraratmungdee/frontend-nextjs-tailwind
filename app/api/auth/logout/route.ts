import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // สร้าง response
    const response = NextResponse.json({
      success: true,
      message: 'ออกจากระบบสำเร็จ'
    });

    // ลบ auth token cookie
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // ตั้งให้หมดอายุทันที
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('Logout API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'เกิดข้อผิดพลาดในการออกจากระบบ' 
      },
      { status: 500 }
    );
  }
}