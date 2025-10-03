import Image from 'next/image';
import { User } from './types';

interface UserAvatarProps {
  user: User;
  size?: number;
}

export default function UserAvatar({ user, size = 40 }: UserAvatarProps) {
  return (
    <div className="flex-shrink-0" style={{ width: size, height: size }}>
      <Image
        className="rounded-full object-cover"
        src={user.avatar || '/default-avatar.png'}
        alt={`${user.first_name} ${user.last_name}`}
        width={size}
        height={size}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = `https://ui-avatars.com/api/?name=${user.first_name}+${user.last_name}&background=6366f1&color=fff`;
        }}
      />
    </div>
  );
}