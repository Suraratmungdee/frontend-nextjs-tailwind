import Link from 'next/link';

interface PageHeaderProps {
    title: string;
    description: string;
    onAddUser?: () => void;
}

export default function PageHeader({
    title,
    description,
    onAddUser
}: PageHeaderProps) {
    return (
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                <p className="mt-2 text-gray-600">{description}</p>
            </div>
            <div className="flex space-x-3">
                <Link
                    href="/"
                    className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                    Logout
                </Link>
            </div>
        </div>
    );
}