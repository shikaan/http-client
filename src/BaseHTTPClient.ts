import { HTTPException } from './HTTPException';
import { retry } from './retry';

type APIResponse<T> = {
  data: T;
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

  protected async request<T>(
    url: string,
    method = 'GET',
    body?: unknown,
    additionalHeaders?: Record<string, string>,
  ): Promise<T> {
    const responseBody = await this.fetchWithRetry<APIResponse<T>>(url, method, body, additionalHeaders);

    return Array.isArray(responseBody.data)
      ? (responseBody.data.map((i) => i.data) as unknown as T)
      : responseBody.data;
  }

  protected async fetchWithRetry<T>(
    url: string,
    method = 'GET',
    body?: unknown,
    additionalHeaders?: Record<string, string>,
    timeout = 3000,
  ): Promise<T> {
    return retry(() => this.fetch(url, method, body, additionalHeaders, timeout), { max: 3 });
  }

  protected async fetch<T>(
    url: string,
    method = 'GET',
    body?: unknown,
    additionalHeaders?: Record<string, string>,
    timeout?: number,
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
      });
      clearTimeout(timer);
    } else {
      response = await fetch(url, {
        method,
        body: JSON.stringify(body),
        headers: { ...this.makeAuthHeaders(), ...additionalHeaders },
      });
    }

    const responseBody = await response.json();

    if (!response.ok) {
      throw new HTTPException(responseBody);
    }

    return responseBody;
  }
}
