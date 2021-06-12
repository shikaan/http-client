import { HTTPException } from './HTTPException';
import { retry } from './retry';

describe('retry', function() {
  it('does not retry in case of success', async function() {
    const t = jest.fn().mockResolvedValue(null);
    await retry(t, { max: 3 });

    expect(t).toBeCalled();
  });

  it('retries max times with Retryable exception', async function() {
    const errorDTO = { status: 500, message: 'Internal Server Error' };
    const t = jest.fn().mockRejectedValue(new HTTPException(errorDTO));

    await expect(retry(t, { max: 3 })).rejects.toThrow(errorDTO.message);
    expect(t).toBeCalledTimes(4);
  });

  it('does not retry other exceptions', async function() {
    const error = new Error('message');
    const t = jest.fn().mockRejectedValue(error);

    await expect(retry(t, { max: 3 })).rejects.toThrow(error);
    expect(t).toBeCalledTimes(1);
  });
});
