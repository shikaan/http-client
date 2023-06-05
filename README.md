# HTTP Client

Simple, opinionated, and dependency free HTTP client for the browser.

## Features

* Retries
* Timeout
* JSON based

## Installation

```
npm i -E @shikaan/http-client
```

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
