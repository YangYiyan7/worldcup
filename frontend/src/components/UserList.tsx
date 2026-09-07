'use client';

import { useEffect, useState } from 'react';
import { fetchUsers } from '@/api/users';

interface User {
  id: number;
  name: string;
  email: string;
}

interface UserListProps {
  className?: string;
}

export function UserList({ className = '' }: UserListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    fetchUsers()
      .then((data) => {
        if (active) setUsers(data);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'Failed to fetch users');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className={`p-4 ${className}`}>
        Loading users...
      </div>
    );
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
