import { UserService } from '../UserService';

// Mock the repository
const mockUserModel = {
  find: jest.fn(),
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  count: jest.fn(),
};

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    jest.clearAllMocks();
    userService = new UserService();
    userService.userModel = mockUserModel as any;
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const mockUsers = [
        { id: 1, name: 'John Doe', email: 'john@example.com' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
      ];

      mockUserModel.find.mockResolvedValue(mockUsers);

      const result = await userService.findAll();

      expect(result).toEqual(mockUsers);
      expect(mockUserModel.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('findById', () => {
    it('should return user by id', async () => {
      const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };

      mockUserModel.findOneBy.mockResolvedValue(mockUser);

      const result = await userService.findById(1);

      expect(result).toEqual(mockUser);
      expect(mockUserModel.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });

    it('should return null when user not found', async () => {
      mockUserModel.findOneBy.mockResolvedValue(null);

      const result = await userService.findById(999);

      expect(result).toBeNull();
      expect(mockUserModel.findOneBy).toHaveBeenCalledWith({ id: 999 });
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDTO = { name: 'John Doe', email: 'john@example.com' };
      const mockUser = { id: 1, ...createUserDTO };

      mockUserModel.findOneBy.mockResolvedValue(null);
      mockUserModel.create.mockReturnValue(mockUser);
      mockUserModel.save.mockResolvedValue(mockUser);

      const result = await userService.create(createUserDTO);

      expect(result).toEqual(mockUser);
      expect(mockUserModel.findOneBy).toHaveBeenCalledWith({ email: createUserDTO.email });
      expect(mockUserModel.create).toHaveBeenCalledWith(createUserDTO);
      expect(mockUserModel.save).toHaveBeenCalledWith(mockUser);
    });

    it('should throw error when email already exists', async () => {
      const createUserDTO = { name: 'John Doe', email: 'john@example.com' };
      const existingUser = { id: 1, name: 'Existing User', email: 'john@example.com' };

      mockUserModel.findOneBy.mockResolvedValue(existingUser);

      await expect(userService.create(createUserDTO)).rejects.toThrow(
        'User with this email already exists'
      );
    });
  });

  describe('delete', () => {
    it('should delete user', async () => {
      const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };

      mockUserModel.findOneBy.mockResolvedValue(mockUser);
      mockUserModel.remove.mockResolvedValue(mockUser);

      await userService.delete(1);

      expect(mockUserModel.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(mockUserModel.remove).toHaveBeenCalledWith(mockUser);
    });

    it('should throw error when user not found', async () => {
      mockUserModel.findOneBy.mockResolvedValue(null);

      await expect(userService.delete(999)).rejects.toThrow('User with ID 999 not found');
    });
  });
});
