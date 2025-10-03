import { UserStatsProps } from './types';

export default function UserStats({ users }: UserStatsProps) {
  const totalUsers = users.length;
  const usersWithAvatar = users.filter(u => u.avatar).length;
  const validEmails = users.filter(u => u.email.includes('@')).length;
  const completeProfiles = users.filter(u => u.first_name && u.last_name).length;

  const stats = [
    {
      title: 'ผู้ใช้ทั้งหมด',
      value: totalUsers,
      color: 'text-indigo-600'
    },
    {
      title: 'มีรูปโปรไฟล์',
      value: usersWithAvatar,
      color: 'text-green-600'
    },
    {
      title: 'อีเมลถูกต้อง',
      value: validEmails,
      color: 'text-blue-600'
    },
    {
      title: 'ข้อมูลครบถ้วน',
      value: completeProfiles,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white p-6 rounded-lg shadow">
          <div className={`text-2xl font-bold ${stat.color}`}>
            {stat.value}
          </div>
          <div className="text-gray-600">{stat.title}</div>
        </div>
      ))}
    </div>
  );
}