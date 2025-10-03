import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { generateToken, cookieOptions } from '../../../../lib/token';

// Interface สำหรับ User data
interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    password: string;
    avatar?: string;
    created_at: string;
    updated_at: string;
}

// Interface สำหรับ Login request
interface LoginRequest {
    email: string;
    password: string;
}

// ฟังก์ชันอ่านข้อมูลจากไฟล์ JSON
function readUsersFromFile(): User[] {
    try {
        const filePath = path.join(process.cwd(), 'data', 'users.json');

        if (!fs.existsSync(filePath)) {
            return [];
        }

        const fileContent = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(fileContent);
    } catch (error) {
        console.error('Error reading users file:', error);
        return [];
    }
}

// ฟังก์ชัน validation email
function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export async function POST(request: NextRequest) {
    try {
        // อ่านข้อมูลจาก request body
        const body: LoginRequest = await request.json();
        const { email, password } = body;

        // Validation
        const errors: Record<string, string> = {};

        if (!email?.trim()) {
            errors.email = 'กรุณากรอกอีเมล';
        } else if (!isValidEmail(email)) {
            errors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
        }

        if (!password) {
            errors.password = 'กรุณากรอกรหัสผ่าน';
        }

        if (Object.keys(errors).length > 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'ข้อมูลไม่ถูกต้อง',
                    errors
                },
                { status: 400 }
            );
        }

        // อ่านข้อมูลผู้ใช้ทั้งหมด
        const users = readUsersFromFile();

        // ค้นหาผู้ใช้จากอีเมล
        const user = users.find(u =>
            u.email.toLowerCase() === email.toLowerCase()
        );

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
                    errors: {
                        email: 'ไม่พบบัญชีผู้ใช้นี้',
                        password: 'กรุณาตรวจสอบข้อมูลอีกครั้ง'
                    }
                },
                { status: 401 }
            );
        }

        // ตรวจสอบรหัสผ่าน
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
                    errors: {
                        password: 'รหัสผ่านไม่ถูกต้อง'
                    }
                },
                { status: 401 }
            );
        }

        // สร้าง JWT Token
        const token = generateToken({
            userId: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name
        });

        // ส่งข้อมูลผู้ใช้กลับ (ไม่ส่งรหัสผ่าน)
        const { password: _, ...userWithoutPassword } = user;

        // สร้าง response และเซ็ต cookie
        const response = NextResponse.json({
            success: true,
            message: 'เข้าสู่ระบบสำเร็จ',
            data: {
                user: userWithoutPassword,
                token: token
            }
        });

        // เซ็ต JWT token ใน cookie
        response.cookies.set('auth-token', token, cookieOptions);

        return response;

    } catch (error) {
        console.error('Login API Error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์'
            },
            { status: 500 }
        );
    }
}