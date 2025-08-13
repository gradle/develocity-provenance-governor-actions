import { jest } from '@jest/globals' /**
 * Unit tests for src/client.ts
 */
import { Client, createClient } from '../client.js'

describe('client.js - publishing', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('Uses Token with API', async () => {
    const jsonResponse = {
      foo: 'bar'
    }

    const fetchMock = jest.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(jsonResponse)
      } as Response)
    )

    const publisher = createClient(
      'https://attest.example.com/',
      'gha-token'
    ) as Client

    const result = await publisher.publishAttestation(
      'tenant1',
      'type1',
      'namespace1',
      'name1',
      'version1',
      'digest1',
      'repository1',
      ['build-scan-id1', 'build-scan-id2'],
      ['query 1', 'query 2']
    )

    const expected = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer gha-token'
      },
      method: 'POST',
      body: JSON.stringify({
        repositoryUrl: 'repository1',
        sha256: 'digest1',
        buildScan: {
          ids: ['build-scan-id1', 'build-scan-id2'],
          queries: ['query 1', 'query 2']
        }
      })
    }

    expect(fetchMock).toHaveBeenCalledWith(
      'https://attest.example.com/tenant1/packages/type1/namespace1/name1/version1/attestations',
      expected
    )

    expect(result).toEqual({
      status: 200,
      success: true,
      errorPayload: null,
      successPayload: jsonResponse
    })
  })

  it('OCI Image (no namespace)', async () => {
    const jsonResponse = {
      foo: 'bar'
    }

    const fetchMock = jest.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(jsonResponse)
      } as Response)
    )

    const publisher = createClient(
      'https://attest.example.com/',
      'gha-token'
    ) as Client

    const result = await publisher.publishAttestation(
      'tenant1',
      'oci',
      null,
      'name1',
      'version1',
      'digest1',
      'repository1',
      ['build-scan-id1', 'build-scan-id2'],
      ['query 1', 'query 2']
    )

    const expected = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer gha-token'
      },
      method: 'POST',
      body: JSON.stringify({
        repositoryUrl: 'repository1',
        sha256: 'digest1',
        buildScan: {
          ids: ['build-scan-id1', 'build-scan-id2'],
          queries: ['query 1', 'query 2']
        }
      })
    }

    expect(fetchMock).toHaveBeenCalledWith(
      'https://attest.example.com/tenant1/packages/oci/name1/version1/attestations',
      expected
    )

    expect(result).toEqual({
      status: 200,
      success: true,
      errorPayload: null,
      successPayload: jsonResponse
    })
  })

  it('Uses basic auth with API', async () => {
    const jsonResponse = {
      foo: 'bar'
    }

    const fetchMock = jest.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(jsonResponse)
      } as Response)
    )

    const publisher = createClient('https://attest.example.com/', {
      username: 'foo',
      password: 'bar'
    }) as Client

    const result = await publisher.publishAttestation(
      'tenant1',
      'type1',
      'namespace1',
      'name1',
      'version1',
      'digest1',
      'repository1',
      ['build-scan-id1', 'build-scan-id2'],
      ['query 1', 'query 2']
    )

    const expected = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Basic Zm9vOmJhcg=='
      },
      method: 'POST',
      body: JSON.stringify({
        repositoryUrl: 'repository1',
        sha256: 'digest1',
        buildScan: {
          ids: ['build-scan-id1', 'build-scan-id2'],
          queries: ['query 1', 'query 2']
        }
      })
    }

    expect(fetchMock).toHaveBeenCalledWith(
      'https://attest.example.com/tenant1/packages/type1/namespace1/name1/version1/attestations',
      expected
    )

    expect(result).toEqual({
      status: 200,
      success: true,
      errorPayload: null,
      successPayload: jsonResponse
    })
  })
})
