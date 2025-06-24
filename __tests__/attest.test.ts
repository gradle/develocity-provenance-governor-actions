/**
 * Unit tests for src/wait.ts
 */
import { attest } from '../src/attest.js'

describe('attest.ts', () => {
  it('Creates an attestation', async () => {
    await attest('oci:purl.org/example/test:1.0.0')
    expect('todo').toEqual('todo')
  })
})
