import { renderHook, act } from '@testing-library/react';
import { useApi } from '../useApi';

describe('wc-005 useApi.execute rethrows', () => {
  it('rejects to the caller when the api function rejects', async () => {
    const failing = async () => {
      throw new Error('nope');
    };
    const { result } = renderHook(() => useApi(failing));
    await act(async () => {
      await expect(result.current.execute()).rejects.toThrow('nope');
    });
  });
});
