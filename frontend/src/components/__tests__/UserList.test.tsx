import { render, screen } from '@testing-library/react';
import { UserList } from '../UserList';

// Mock the fetchUsers function
jest.mock('@/api/users', () => ({
  fetchUsers: jest.fn(),
}));

const mockFetchUsers = require('@/api/users').fetchUsers;

describe('UserList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    mockFetchUsers.mockImplementation(() => new Promise(() => {}));
    
    render(<UserList />);
    
    expect(screen.getByText('Loading users...')).toBeInTheDocument();
  });

  it('renders users list when data is fetched', async () => {
    const mockUsers = [
      { id: 1, name: 'John Doe', email: 'john@example.com', createdAt: '2024-01-01' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', createdAt: '2024-01-02' },
    ];
    
    mockFetchUsers.mockResolvedValue(mockUsers);
    
    render(<UserList />);
    
    expect(await screen.findByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });

  it('renders error state when fetch fails', async () => {
    mockFetchUsers.mockRejectedValue(new Error('Failed to fetch users'));
    
    render(<UserList />);
    
    expect(await screen.findByText('Error: Failed to fetch users')).toBeInTheDocument();
  });

  it('renders empty state when no users', async () => {
    mockFetchUsers.mockResolvedValue([]);
    
    render(<UserList />);
    
    expect(await screen.findByText('No users found.')).toBeInTheDocument();
  });
});
