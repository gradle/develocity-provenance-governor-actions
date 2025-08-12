import { jest } from '@jest/globals'
import { Client, createClient } from '../client.js'
import { PackageURL } from 'packageurl-js'

describe('client.js - policy evaluation', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('Evaluates policy with token', async () => {
    const jsonResponse = { foo: 'bar' }
    const fetchMock = jest.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(jsonResponse)
      } as Response)
    )

    const client = createClient(
      'https://policy.example.com/',
      'gha-token'
    ) as Client
    const purl = new PackageURL('npm', 'namespace1', 'name1', '1.0.0')
    const result = await client.evaluatePolicy(
      'tenant1',
      'scan1',
      purl,
      'digest1',
      'repository1'
    )

    const expected = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer gha-token'
      },
      method: 'POST',
      body: JSON.stringify({
        repositoryUrl: 'repository1',
        sha256: 'digest1'
      })
    }

    expect(fetchMock).toHaveBeenCalledWith(
      '/tenant1/packages/npm/namespace1/name1/1.0.0/policy-scans/scan1',
      expected
    )
    expect(result).toEqual({
      status: 200,
      success: true,
      successPayload: jsonResponse,
      errorPayload: null
    })
  })

  it('Evaluates policy with basic auth', async () => {
    const jsonResponse = { foo: 'bar' }
    const fetchMock = jest.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(jsonResponse)
      } as Response)
    )

    const client = createClient('https://policy.example.com/', {
      username: 'foo',
      password: 'bar'
    }) as Client
    const purl = new PackageURL('npm', 'namespace1', 'name1', '1.0.0')
    const result = await client.evaluatePolicy(
      'tenant1',
      'scan1',
      purl,
      'digest1',
      'repository1'
    )

    const expected = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Basic Zm9vOmJhcg=='
      },
      method: 'POST',
      body: JSON.stringify({
        repositoryUrl: 'repository1',
        sha256: 'digest1'
      })
    }

    expect(fetchMock).toHaveBeenCalledWith(
      '/tenant1/packages/npm/namespace1/name1/1.0.0/policy-scans/scan1',
      expected
    )
    expect(result).toEqual({
      status: 200,
      success: true,
      successPayload: jsonResponse,
      errorPayload: null
    })
  })

  it('Evaluates policy with no namespace', async () => {
    const jsonResponse = { foo: 'bar' }
    const fetchMock = jest.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(jsonResponse)
      } as Response)
    )

    const client = createClient(
      'https://policy.example.com/',
      'gha-token'
    ) as Client
    const purl = new PackageURL('oci', null, 'name1', '1.0.0')
    const result = await client.evaluatePolicy(
      'tenant1',
      'scan1',
      purl,
      'digest1',
      'repository1'
    )

    const expected = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer gha-token'
      },
      method: 'POST',
      body: JSON.stringify({
        repositoryUrl: 'repository1',
        sha256: 'digest1'
      })
    }

    expect(fetchMock).toHaveBeenCalledWith(
      '/tenant1/packages/oci/name1/1.0.0/policy-scans/scan1',
      expected
    )
    expect(result).toEqual({
      status: 200,
      success: true,
      successPayload: jsonResponse,
      errorPayload: null
    })
  })
})
