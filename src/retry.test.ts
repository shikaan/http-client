import { HTTPException } from './HTTPException.js';
import { retry } from './retry.js';
import { stub, assert } from 'sinon';
import { equal } from 'node:assert/strict';

describe('retry', function () {
  it('does not retry in case of success', async function () {
    const t = stub().resolves(null);
    await retry(t, { max: 3 });

    assert.calledOnce(t);
  });

  it('retries max times with Retryable exception', async function () {
    const errorDTO = { status: 500, message: 'Internal Server Error' };
    const t = stub().rejects(new HTTPException(errorDTO));

    try {
      await retry(t, { max: 3 });
      assert.fail('Did not throw');
    } catch (e: any) {
      equal(e.message, errorDTO.message);
      assert.callCount(t, 4);
    }
  });

  it('does not retry other exceptions', async function () {
    const error = new Error('message');
    const t = stub().rejects(error);

    try {
      await retry(t, { max: 3 });
      assert.fail('Did not throw');
    } catch (e: any) {
      equal(e, error);
      assert.calledOnce(t);
    }
  });
});
