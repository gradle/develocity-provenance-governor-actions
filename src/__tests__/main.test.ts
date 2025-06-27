/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * To mock dependencies in ESM, you can create fixtures that export mock
 * functions and objects. For example, the core module is mocked in this test,
 * so that the actual '@actions/core' module is not imported.
 */
import { jest } from '@jest/globals'
import * as core from '../__fixtures__/core.js'
import { createClient } from '../__fixtures__/publisher-client.js'
import { createReporter } from '../__fixtures__/reporter.js'
import { AttestationPublisher } from '../publisher-client.js'
import { Reporter } from '../reporter.js'
import { PackageURL } from 'packageurl-js'

// Mocks should be declared before the module being tested is imported.
jest.unstable_mockModule('@actions/core', () => core)
jest.unstable_mockModule('../publisher-client.js', () => ({ createClient }))
jest.unstable_mockModule('../reporter.js', () => ({ createReporter }))

// The module being tested should be imported dynamically. This ensures that the
// mocks are used in place of any actual dependencies.
const { run } = await import('../main.js')

const mockReporter = {
  reportSuccess: jest.fn(),
  reportError: jest.fn()
}

describe('main.ts', () => {
  beforeEach(() => {
    core.summary.emptyBuffer()
    jest.clearAllMocks()
    createReporter.mockImplementation((): Reporter => mockReporter)
    core.getIDToken.mockImplementation(
      (): Promise<string> => Promise.resolve('gha-token')
    )
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('Creates attestation', async () => {
    const payload = {
      publishedAttestations: [
        {
          type: 'https://cavendish.dev/java-toolchain/v1',
          downloadUrl:
            'https://todo.example.com/attestations/java-toolchain.json'
        },
        {
          type: 'https://cavendish.dev/npm-toolchain/v1',
          downloadUrl:
            'https://todo.example.com/attestations/npm-toolchain.json'
        }
      ]
    }

    createClient.mockImplementation((): AttestationPublisher => {
      return {
        publishAttestation: jest.fn(() =>
          Promise.resolve({
            status: 200,
            success: true,
            successPayload: payload
          })
        )
      }
    })

    core.getInput
      .mockClear()
      .mockReturnValueOnce('tenant11') // tenant
      .mockReturnValueOnce('type11') // subject-type
      .mockReturnValueOnce('namespace11') // subject-namespace
      .mockReturnValueOnce('name11') // subject-name
      .mockReturnValueOnce('version11') // subject-version
      .mockReturnValueOnce('digest11') // subject-digest
      .mockReturnValueOnce('https://repo.example.com/') // subject-repository-url
      .mockReturnValueOnce('https://attest.example.com/') // attestation-publisher-url
      .mockReturnValueOnce('') // attestation-publisher-api-token
    await run()

    // check error first, if something went wrong, fail fast
    expect(core.setFailed).not.toHaveBeenCalled()

    // expect interactions
    expect(createClient).toHaveBeenNthCalledWith(
      1,
      'https://attest.example.com/',
      'gha-token'
    )

    expect(createReporter).toHaveBeenCalledTimes(1)
    expect(mockReporter.reportSuccess).toHaveBeenNthCalledWith(
      1,
      new PackageURL('type11', 'namespace11', 'name11', 'version11'),
      'digest11',
      payload
    )
  })

  it('Attestation creation partial error', async () => {
    const payload = {
      type: 'error-type22',
      title: 'error-title22',
      detail: 'error-detail22',
      instance: 'error-instance22',
      publishedAttestations: [
        {
          type: 'https://cavendish.dev/java-toolchain/v1',
          downloadUrl:
            'https://todo.example.com/attestations/java-toolchain.json'
        }
      ],
      failedAttestations: [
        {
          type: 'https://cavendish.dev/npm-toolchain/v1',
          detail: 'Access denied to repository.'
        }
      ]
    }

    createClient.mockImplementation((): AttestationPublisher => {
      return {
        publishAttestation: jest.fn(() =>
          Promise.resolve({
            status: 200,
            success: false,
            successPayload: {},
            errorPayload: payload
          })
        )
      }
    })

    core.getInput
      .mockClear()
      .mockReturnValueOnce('tenant22') // tenant
      .mockReturnValueOnce('type22') // subject-type
      .mockReturnValueOnce('namespace22') // subject-namespace
      .mockReturnValueOnce('name22') // subject-name
      .mockReturnValueOnce('version22') // subject-version
      .mockReturnValueOnce('digest22') // subject-digest
      .mockReturnValueOnce('https://repo.example.com/') // subject-repository-url
      .mockReturnValueOnce('https://attest.example.com/') // attestation-publisher-url
      .mockReturnValueOnce('') // attestation-publisher-api-token
    await run()

    // check error first, if something went wrong, fail fast
    expect(core.setFailed).toHaveBeenCalledWith(
      'Attestation publisher for subject: pkg:type22/namespace22/name22@version22 failed: error-title22'
    )

    // expect interactions
    expect(createClient).toHaveBeenNthCalledWith(
      1,
      'https://attest.example.com/',
      'gha-token'
    )

    expect(createReporter).toHaveBeenCalledTimes(1)
    expect(mockReporter.reportError).toHaveBeenNthCalledWith(
      1,
      new PackageURL('type22', 'namespace22', 'name22', 'version22'),
      'digest22',
      payload
    )
  })
})
