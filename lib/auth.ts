import Cookies from 'js-cookie';

// Interface สำหรับ User data
export interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    avatar?: string;
    created_at: string;
    updated_at: string;
}

// เก็บ user data ใน localStorage
export function setUserData(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
}

// ดึง user data จาก localStorage
export function getUserData(): User | null {
    try {
        const userData = localStorage.getItem('user');
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
    }
}

// ลบ user data จาก localStorage
export function clearUserData(): void {
    localStorage.removeItem('user');
}

// ตรวจสอบว่า user login อยู่หรือไม่
export function isAuthenticated(): boolean {
    const token = Cookies.get('auth-token');
    const userData = getUserData();
    return !!(token && userData);
}

// Logout function
export async function logout(): Promise<boolean> {
    try {
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (data.success) {
            // ลบ user data จาก localStorage
            clearUserData();

            // Redirect ไปหน้า login
            window.location.href = '/login';
            return true;
        }

        return false;
    } catch (error) {
        console.error('Logout error:', error);
        return false;
    }
}

// ดึงข้อมูล user ปัจจุบัน
export function getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    return getUserData();
}