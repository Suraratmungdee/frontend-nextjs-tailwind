'use client';

import { useState, useEffect } from 'react';
import {
    UserTable,
    UserHeader,
    EditUserModal,
    User
} from '../components';
import { logout, getCurrentUser } from '../../lib/auth';

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        // ดึงข้อมูลผู้ใช้ปัจจุบัน
        const fetchCurrentUser = async () => {
            try {
                const user = await getCurrentUser();
                setCurrentUser(user);
            } catch (err) {
                console.error('Error getting current user:', err);
            }
        };

        // ดึงข้อมูลจาก API
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/users');
                const data = await response.json();
                
                if (data.success) {
                    setUsers(data.data);
                } else {
                    setError(data.message || 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
                }
            } catch (err) {
                console.error('Error fetching users:', err);
                setError('ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
            } finally {
                setLoading(false);
            }
        };

        fetchCurrentUser();
        fetchUsers();
    }, []);

    // Handler functions
    const handleEdit = (user: User) => {
        setEditingUser(user);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setEditingUser(null);
        setIsEditModalOpen(false);
    };

    const handleSaveUser = (updatedUser: User) => {
        setUsers(users.map(user => 
            user.id === updatedUser.id ? updatedUser : user
        ));
    };

    const handleDelete = async (user: User) => {
        // ตรวจสอบว่าเป็นผู้ใช้ที่กำลัง login อยู่หรือไม่
        if (currentUser && user.id === currentUser.id) {
            alert('คุณไม่สามารถลบบัญชีของตัวเองได้');
            return;
        }

        if (confirm(`คุณต้องการลบ ${user.first_name} ${user.last_name} หรือไม่?`)) {
            try {
                const response = await fetch(`/api/users/${user.id}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const data = await response.json();

                if (data.success) {
                    // อัปเดต state โดยลบผู้ใช้ออกจาก list
                    setUsers(users.filter(u => u.id !== user.id));
                    alert(data.message || 'ลบข้อมูลสำเร็จ');
                } else {
                    alert(data.message || 'เกิดข้อผิดพลาดในการลบข้อมูล');
                }
            } catch (error) {
                console.error('Delete user error:', error);
                alert('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง');
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <UserHeader
                    title="รายการผู้ใช้"
                    description="จัดการข้อมูลผู้ใช้ทั้งหมดในระบบ"
                />

                <UserTable
                    users={users}
                    loading={loading}
                    error={error}
                    currentUser={currentUser}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />

                <EditUserModal
                    user={editingUser}
                    isOpen={isEditModalOpen}
                    onClose={handleCloseEditModal}
                    onSave={handleSaveUser}
                />
            </div>
        </div>
    );
}