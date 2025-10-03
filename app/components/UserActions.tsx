import { UserActionsProps } from './types';

export default function UserActions({ user, currentUser, onEdit, onDelete }: UserActionsProps) {
    const isCurrentUser = currentUser && user.id === currentUser.id;

    return (
        <div className="flex space-x-2">
            <button
                onClick={() => onEdit(user)}
                className="text-yellow-600 hover:text-yellow-900 px-3 py-1 border border-yellow-600 rounded hover:bg-yellow-50 transition-colors"
            >
                แก้ไข
            </button>
            {!isCurrentUser && (
                <button
                    onClick={() => onDelete(user)}
                    className="text-red-600 hover:text-red-900 px-3 py-1 border border-red-600 rounded hover:bg-red-50 transition-colors"
                >
                    ลบ
                </button>
            )}
            {isCurrentUser && (
                <span className="text-gray-400 px-3 py-1 border border-gray-300 rounded bg-gray-50 cursor-not-allowed">
                    คุณ
                </span>
            )}
        </div>
    );
}