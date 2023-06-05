import { HTTPException } from './HTTPException';

interface RetryOptions {
  max: number;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const isHTTPException = (e: Error | HTTPException): e is HTTPException =>
  'type' in e && e.type === HTTPException.type;
const isRetryable = (e: Error) =>
  e.name === 'AbortError' ||
  (isHTTPException(e) && (e.status > 499 || e.status === 429));

export async function retry<T>(
  promise: () => Promise<T>,
  options: RetryOptions
): Promise<T> {
  const perform = async (attempt = 1): Promise<T> => {
    try {
      return await promise();
    } catch (e: any) {
      if (attempt > options.max || !isRetryable(e)) {
        throw e;
      }

      await sleep(100 * attempt);
      return perform(attempt + 1);
    }
  };

  return perform();
}
