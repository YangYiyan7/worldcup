import { UserService } from '../UserService';

const mockUserModel: any = {
  find: jest.fn(), findOneBy: jest.fn(), create: jest.fn(),
  save: jest.fn(), remove: jest.fn(), count: jest.fn(),
};

describe('wc-001 update email uniqueness', () => {
  let svc: UserService;
  beforeEach(() => {
    jest.clearAllMocks();
    svc = new UserService();
    svc.userModel = mockUserModel;
  });

  it('rejects changing email to one used by another user', async () => {
    mockUserModel.findOneBy
      .mockResolvedValueOnce({ id: 1, name: 'A', email: 'a@x.com' })
      .mockResolvedValueOnce({ id: 2, name: 'B', email: 'b@x.com' });
    await expect(svc.update(1, { email: 'b@x.com' }))
      .rejects.toThrow('User with this email already exists');
    expect(mockUserModel.save).not.toHaveBeenCalled();
  });
});
