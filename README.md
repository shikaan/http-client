# HTTP Client

## Usage

```typescript
import { BaseHTTPClient } from 'http-client';

export class APIClient extends BaseHTTPClient {
  constructor(token?: string) {
    super();
    this.token = token;
  }

  setAccessToken(token: string): void {
    this.token = token;
  }

  async queryUsers() {
    const { data } = await this.fetchWithRetry(`${BASE_URL}/users`);

    return data;
  }
}

export const apiClient = new APIClient();
```