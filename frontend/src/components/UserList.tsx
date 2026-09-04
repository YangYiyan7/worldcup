import { fetchUsers } from '@/api/users';

interface User {
  id: number;
  name: string;
  email: string;
}

interface UserListProps {
  className?: string;
}

export async function UserList({ className = '' }: UserListProps) {
  let users: User[] = [];
  let error: string | null = null;

  try {
    users = await fetchUsers();
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to fetch users';
  }

  if (error) {
    return (
      <div className={`p-4 text-red-600 ${className}`}>
        Error: {error}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className={`p-4 text-gray-500 ${className}`}>
        No users found.
      </div>
    );
  }

  return (
    <div className={`p-4 ${className}`}>
      <ul className="space-y-2">
        {users.map((user) => (
          <li
            key={user.id}
            className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="font-medium">{user.name}</div>
            <div className="text-sm text-gray-600">{user.email}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
