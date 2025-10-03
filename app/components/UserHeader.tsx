import Link from 'next/link';
import { logout, getCurrentUser } from '../../lib/auth';
import { useEffect, useState } from 'react';

interface UserHeaderProps {
    title: string;
    description: string;
}

export default function UserHeader({
    title,
    description
}: UserHeaderProps) {
    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        const user = getCurrentUser();
        setCurrentUser(user);
    }, []);

    const handleLogout = async () => {
        if (confirm('คุณต้องการออกจากระบบหรือไม่?')) {
            await logout();
        }
    };

    return (
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                <p className="mt-2 text-gray-600">{description}</p>

            </div>

            <div className="flex items-center space-x-3">
                <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                    ออกจากระบบ
                </button>
            </div>
        </div>
    );
}