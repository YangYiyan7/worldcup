import { UserService } from '../UserService';

const mockUserModel: any = {
  find: jest.fn(), findOneBy: jest.fn(), create: jest.fn(),
  save: jest.fn(), remove: jest.fn(), count: jest.fn(),
};

describe('wc-002 update user not found', () => {
  let svc: UserService;
  beforeEach(() => {
    jest.clearAllMocks();
    svc = new UserService();
    svc.userModel = mockUserModel;
  });

  it('throws User not found when updating a missing id', async () => {
    mockUserModel.findOneBy.mockResolvedValue(null);
    await expect(svc.update(999, { name: 'x' })).rejects.toThrow(/not found/i);
  });
});
