const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7001';

export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export async function fetchUsers(): Promise<User[]> {
  const response = await fetch(`${API_BASE_URL}/api/users`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.statusText}`);
  }

  const result: ApiResponse<User[]> = await response.json();
  
  if (!result.success) {
    throw new Error(result.message || 'Failed to fetch users');
  }

  return result.data;
}

export async function fetchUserById(id: number): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user: ${response.statusText}`);
  }

  const result: ApiResponse<User> = await response.json();
  
  if (!result.success) {
    throw new Error(result.message || 'Failed to fetch user');
  }

  return result.data;
}

export async function createUser(data: CreateUserRequest): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/api/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to create user: ${response.statusText}`);
  }

  const result: ApiResponse<User> = await response.json();
  
  if (!result.success) {
    throw new Error(result.message || 'Failed to create user');
  }

  return result.data;
}

export async function updateUser(id: number, data: Partial<CreateUserRequest>): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to update user: ${response.statusText}`);
  }

  const result: ApiResponse<User> = await response.json();
  
  if (!result.success) {
    throw new Error(result.message || 'Failed to update user');
  }

  return result.data;
}

export async function deleteUser(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to delete user: ${response.statusText}`);
  }

  const result: ApiResponse<void> = await response.json();
  
  if (!result.success) {
    throw new Error(result.message || 'Failed to delete user');
  }
}
