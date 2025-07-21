import { jest } from '@jest/globals'

/**
 * Unit tests for src/publisher-client.ts
 */
import { AttestationPublisher } from '../publisher-client.js'

describe('publisher-client.js', () => {
  it('Creates an attestation', async () => {
    // FIXME, this class isn't actually testing anything

    const publisher: AttestationPublisher = {
      publishAttestation: jest.fn(() =>
        Promise.resolve({
          status: 200,
          success: true
        })
      )
    }

    const result = await publisher.publishAttestation(
      'tenant1',
      'type1',
      'namespace1',
      'name1',
      'version1',
      'digest1',
      'repository1'
    )

    expect(result).toEqual({
      status: 200,
      success: true
    })
  })
})
