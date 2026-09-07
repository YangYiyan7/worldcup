import { UserService } from '../UserService';

const mockUserModel: any = {
  find: jest.fn(), findOneBy: jest.fn(), create: jest.fn(),
  save: jest.fn(), remove: jest.fn(), count: jest.fn(),
};

describe('wc-003 findAll empty', () => {
  let svc: UserService;
  beforeEach(() => {
    jest.clearAllMocks();
    svc = new UserService();
    svc.userModel = mockUserModel;
  });

  it('returns an empty array (not null) when there are no users', async () => {
    mockUserModel.find.mockResolvedValue([]);
    const result = await svc.findAll();
    expect(result).toEqual([]);
  });
});
