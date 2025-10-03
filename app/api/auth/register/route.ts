import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

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

// Interface สำหรับ Register request
interface RegisterRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

// ฟังก์ชันอ่านข้อมูลจากไฟล์ JSON
function readUsersFromFile(): User[] {
    try {
        const filePath = path.join(process.cwd(), 'data', 'users.json');

        // ตรวจสอบว่าไฟล์มีอยู่หรือไม่
        if (!fs.existsSync(filePath)) {
            // สร้างไฟล์ใหม่ถ้าไม่มี
            fs.writeFileSync(filePath, JSON.stringify([], null, 2));
            return [];
        }

        const fileContent = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(fileContent);
    } catch (error) {
        console.error('Error reading users file:', error);
        return [];
    }
}

// ฟังก์ชันเขียนข้อมูลลงไฟล์ JSON
function writeUsersToFile(users: User[]): boolean {
    try {
        const filePath = path.join(process.cwd(), 'data', 'users.json');

        // สร้างโฟลเดอร์ data ถ้าไม่มี
        const dataDir = path.dirname(filePath);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing users file:', error);
        return false;
    }
}

// ฟังก์ชันสร้าง ID ใหม่
function generateNewId(users: User[]): number {
    if (users.length === 0) return 1;
    return Math.max(...users.map(user => user.id)) + 1;
}

// ฟังก์ชัน validation email
function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export async function POST(request: NextRequest) {
    try {
        // อ่านข้อมูลจาก request body
        const body: RegisterRequest = await request.json();
        const { firstName, lastName, email, password } = body;

        // Validation
        const errors: Record<string, string> = {};

        if (!firstName?.trim()) {
            errors.firstName = 'กรุณากรอกชื่อ';
        }

        if (!lastName?.trim()) {
            errors.lastName = 'กรุณากรอกนามสกุล';
        }

        if (!email?.trim()) {
            errors.email = 'กรุณากรอกอีเมล';
        } else if (!isValidEmail(email)) {
            errors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
        }

        if (!password || password.length < 6) {
            errors.password = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
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

        // อ่านข้อมูลผู้ใช้ที่มีอยู่
        const existingUsers = readUsersFromFile();

        // ตรวจสอบว่าอีเมลซ้ำหรือไม่
        const existingUser = existingUsers.find(user =>
            user.email.toLowerCase() === email.toLowerCase()
        );

        if (existingUser) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'อีเมลนี้ถูกใช้แล้ว',
                    errors: { email: 'อีเมลนี้ถูกใช้แล้ว' }
                },
                { status: 409 }
            );
        }

        // เข้ารหัสรหัสผ่าน
        const hashedPassword = await bcrypt.hash(password, 10);

        // สร้างผู้ใช้ใหม่
        const newUser: User = {
            id: generateNewId(existingUsers),
            email: email.toLowerCase(),
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            password: hashedPassword,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName)}+${encodeURIComponent(lastName)}&background=6366f1&color=fff`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        // เพิ่มผู้ใช้ใหม่ลงในรายการ
        const updatedUsers = [...existingUsers, newUser];

        // บันทึกลงไฟล์
        const saveSuccess = writeUsersToFile(updatedUsers);

        if (!saveSuccess) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล'
                },
                { status: 500 }
            );
        }

        // ส่งข้อมูลกลับ (ไม่ส่งรหัสผ่าน)
        const { password: _, ...userWithoutPassword } = newUser;

        return NextResponse.json({
            success: true,
            message: 'สมัครสมาชิกสำเร็จ',
            data: {
                user: userWithoutPassword
            }
        }, { status: 201 });

    } catch (error) {
        console.error('Register API Error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์'
            },
            { status: 500 }
        );
    }
}

// GET method สำหรับดูข้อมูลผู้ใช้ทั้งหมด (สำหรับ testing/admin)
export async function GET() {
    try {
        const users = readUsersFromFile();

        // ลบรหัสผ่านออกจากข้อมูลที่ส่งกลับ
        const usersWithoutPassword = users.map(({ password, ...user }) => user);

        return NextResponse.json({
            success: true,
            data: {
                users: usersWithoutPassword,
                total: users.length
            }
        });
    } catch (error) {
        console.error('Get users API Error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'เกิดข้อผิดพลาดในการดึงข้อมูล'
            },
            { status: 500 }
        );
    }
}