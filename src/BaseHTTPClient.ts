import { HTTPException } from './HTTPException.js';
import { retry } from './retry.js';

type FetchOptions = Partial<{
  method: RequestInit['method'];
  body: any;
  headers: Record<string, string>;
  mode: RequestInit['mode'];
  credentials: RequestInit['credentials'];
  timeout: number;
  maxRetries: number;
}>;

const DEFAULT_OPTIONS = {
  method: 'GET',
  mode: 'cors',
  timeout: 3000,
  maxRetries: 3,
};

export abstract class BaseHTTPClient {
  protected token?: string;

  protected makeAuthHeaders(): Record<string, string> {
    if (!this.token) {
      return {};
    }

    return {
      Authorization: `Bearer ${this.token}`,
    };
  }

  protected setAccessToken(token: string): void {
    this.token = token;
  }

  protected async fetch<T>(
    url: string,
    options: FetchOptions = {}
  ): Promise<T> {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    return retry(
      () =>
        this.doFetch(url, opts.method, opts.body, opts.headers, opts.timeout),
      { max: opts.maxRetries }
    );
  }

  private async doFetch<T>(
    url: string,
    method = 'GET',
    body?: unknown,
    additionalHeaders?: Record<string, string>,
    timeout?: number,
    mode?: RequestMode,
    credentials?: RequestCredentials
  ): Promise<T> {
    let response;
    if ('AbortController' in globalThis && timeout) {
      const abortController = new AbortController();

      const timer = setTimeout(() => abortController.abort(), timeout);
      response = await fetch(url, {
        method,
        body: JSON.stringify(body),
        headers: { ...this.makeAuthHeaders(), ...additionalHeaders },
        signal: abortController.signal,
        mode,
        credentials,
      });
      clearTimeout(timer);
    } else {
      response = await fetch(url, {
        method,
        body: JSON.stringify(body),
        headers: { ...this.makeAuthHeaders(), ...additionalHeaders },
        mode,
      });
    }

    const responseBody = await response.json();

    if (!response.ok) {
      throw new HTTPException(responseBody);
    }

    return responseBody;
  }
}
