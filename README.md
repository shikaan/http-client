# HTTP Client

## Usage

```typescript
import {BaseHTTPClient} from 'http-client';

export class APIClient extends BaseHTTPClient {
  constructor(token?: string) {
    super();
    this.token = token;
  }

  async queryUsers() {
    const {data} = await this.fetch(`${BASE_URL}/users`, {timeout: 3000, maxRetries: 3});

    return data;
  }
}

export const apiClient = new APIClient();
```