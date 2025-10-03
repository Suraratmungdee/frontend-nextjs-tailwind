import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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

export async function GET() {
    try {
        const users = readUsersFromFile();

        const usersWithoutPassword = users.map(({ password, ...user }) => ({
            ...user,
            avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.first_name)}+${encodeURIComponent(user.last_name)}&background=6366f1&color=fff`
        }));

        return NextResponse.json({
            success: true,
            data: usersWithoutPassword
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