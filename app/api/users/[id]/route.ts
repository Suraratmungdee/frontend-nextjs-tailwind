import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const userId = parseInt(params.id);
        const body = await request.json();
        const { email, first_name, last_name, avatar } = body;

        // ตรวจสอบว่า ID เป็นตัวเลขหรือไม่
        if (isNaN(userId)) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'ID ผู้ใช้ไม่ถูกต้อง'
                },
                { status: 400 }
            );
        }

        // Validate required fields (ไม่รวมอีเมลเพราะไม่สามารถแก้ไขได้)
        if (!first_name || !last_name) {
            return NextResponse.json({
                success: false,
                message: 'กรุณากรอกชื่อและนามสกุลให้ครบถ้วน'
            }, { status: 400 });
        }

        // อ่านข้อมูลผู้ใช้ที่มีอยู่
        const existingUsers = readUsersFromFile();

        // ค้นหาผู้ใช้ที่ต้องการแก้ไข
        const userIndex = existingUsers.findIndex(user => user.id === userId);

        if (userIndex === -1) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'ไม่พบผู้ใช้ที่ต้องการแก้ไข'
                },
                { status: 404 }
            );
        }

        // อัปเดตข้อมูลผู้ใช้ (ไม่แก้ไขอีเมล)
        const updatedUser = {
            ...existingUsers[userIndex],
            first_name,
            last_name,
            avatar: avatar || existingUsers[userIndex].avatar,
            updated_at: new Date().toISOString()
        };

        existingUsers[userIndex] = updatedUser;

        // บันทึกลงไฟล์
        const saveSuccess = writeUsersToFile(existingUsers);

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
        const { password: _, ...userWithoutPassword } = updatedUser;

        return NextResponse.json({
            success: true,
            message: 'แก้ไขข้อมูลผู้ใช้สำเร็จ',
            data: userWithoutPassword
        });

    } catch (error) {
        console.error('Update user API Error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์'
            },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const userId = parseInt(params.id);

        // ตรวจสอบว่า ID เป็นตัวเลขหรือไม่
        if (isNaN(userId)) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'ID ผู้ใช้ไม่ถูกต้อง'
                },
                { status: 400 }
            );
        }

        // อ่านข้อมูลผู้ใช้ที่มีอยู่
        const existingUsers = readUsersFromFile();

        // ค้นหาผู้ใช้ที่ต้องการลบ
        const userIndex = existingUsers.findIndex(user => user.id === userId);

        if (userIndex === -1) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'ไม่พบผู้ใช้ที่ต้องการลบ'
                },
                { status: 404 }
            );
        }

        // เก็บข้อมูลผู้ใช้ที่จะลบ (สำหรับ response)
        const deletedUser = existingUsers[userIndex];

        // ลบผู้ใช้ออกจาก array
        const updatedUsers = existingUsers.filter(user => user.id !== userId);

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
        const { password: _, ...userWithoutPassword } = deletedUser;

        return NextResponse.json({
            success: true,
            message: `ลบผู้ใช้ ${deletedUser.first_name} ${deletedUser.last_name} สำเร็จ`,
            data: {
                deletedUser: userWithoutPassword,
                remainingCount: updatedUsers.length
            }
        });

    } catch (error) {
        console.error('Delete user API Error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์'
            },
            { status: 500 }
        );
    }
}