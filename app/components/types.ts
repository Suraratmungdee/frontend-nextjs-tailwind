// Type definitions
export interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    avatar?: string;
    created_at?: string;
    updated_at?: string;
}

export interface UserTableProps {
    users: User[];
    loading: boolean;
    error: string | null;
    currentUser?: User | null;
    onEdit: (user: User) => void;
    onDelete: (user: User) => void;
}

export interface UserStatsProps {
    users: User[];
}

export interface UserActionsProps {
    user: User;
    currentUser?: User | null;
    onEdit: (user: User) => void;
    onDelete: (user: User) => void;
}