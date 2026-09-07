import { fetchUsers } from '../users';

describe('wc-004 fetchUsers checks success flag', () => {
  beforeEach(() => {
    global.fetch = jest.fn() as any;
  });
  afterEach(() => {
    delete (global as any).fetch;
  });

  it('throws when the payload success flag is false', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ success: false, message: 'boom', data: null }),
    });
    await expect(fetchUsers()).rejects.toThrow('boom');
  });
});
