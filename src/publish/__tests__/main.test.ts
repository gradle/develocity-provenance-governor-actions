/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * To mock dependencies in ESM, you can create fixtures that export mock
 * functions and objects. For example, the core module is mocked in this test,
 * so that the actual '@actions/core' module is not imported.
 */
import { jest } from '@jest/globals'
import * as core from '../../__fixtures__/core.js'
import { createClient } from '../../__fixtures__/client.js'
import { createPublisherReporter } from '../../__fixtures__/reporter.js'
import { Client, PolicyResult, PublisherResult } from '../../client.js'
import { Reporter } from '../../reporter.js'
import * as fs from 'node:fs'

// Mocks should be declared before the module being tested is imported.
jest.unstable_mockModule('@actions/core', () => core)
jest.unstable_mockModule('../../client.js', () => ({ createClient }))
jest.unstable_mockModule('../reporter.js', () => ({
  createPublisherReporter
}))

const mockReporter = {
  report: jest.fn(),
  reportError: jest.fn(),
  reportSuccess: jest.fn()
}

// The module being tested should be imported dynamically. This ensures that the
// mocks are used in place of any actual dependencies.
const { run } = await import('../main.js')

describe('main.ts', () => {
  beforeEach(() => {
    core.summary.emptyBuffer()
    jest.clearAllMocks()
    createPublisherReporter.mockImplementation(
      (): Reporter<never, never, never> => mockReporter
    )
    core.getIDToken.mockImplementation(
      (): Promise<string> => Promise.resolve('gha-token')
    )
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('Creates attestation', async () => {
    // given
    const payload = JSON.parse(
      fs.readFileSync('src/publish/__fixtures__/success.json', 'utf8')
    )

    const client: Client = {
      publishAttestation: jest.fn(() =>
        Promise.resolve(new PublisherResult(200, true, payload))
      ),
      evaluatePolicy(): Promise<PolicyResult> {
        throw new Error('Not implemented')
      }
    }

    createClient.mockImplementation((): Client => client)

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
      .mockReturnValueOnce('') // username
      .mockReturnValueOnce('') // password
    core.getMultilineInput
      .mockClear()
      .mockReturnValueOnce(['build-scan-id11', 'build-scan-id12']) // build-scan-ids
      .mockReturnValueOnce(['query 1', 'query 2']) // build-scan-queries

    // when
    await run()

    // then
    // handled by the reporter
    expect(core.setFailed).not.toHaveBeenCalled()

    // expect interactions
    expect(createClient).toHaveBeenNthCalledWith(
      1,
      'https://attest.example.com/',
      'gha-token'
    )

    expect(createPublisherReporter).toHaveBeenCalledTimes(1)
    expect(client.publishAttestation).toHaveBeenNthCalledWith(
      1,
      'tenant11',
      'type11',
      'namespace11',
      'name11',
      'version11',
      'digest11',
      'https://repo.example.com/',
      ['build-scan-id11', 'build-scan-id12'],
      ['query 1', 'query 2']
    )
    const subject = {
      name: 'pkg:type11/namespace11/name11@version11',
      digest: { sha256: 'digest11' }
    }
    expect(mockReporter.report).toHaveBeenNthCalledWith(
      1,
      200,
      subject,
      payload
    )

    expect(core.summary.write).toHaveBeenCalled()
  })

  it('Attestation creation partial error', async () => {
    const payload = JSON.parse(
      fs.readFileSync('src/publish/__fixtures__/partial-error.json', 'utf8')
    )

    const client: Client = {
      publishAttestation: jest.fn(() =>
        Promise.resolve(new PublisherResult(500, false, payload))
      ),
      evaluatePolicy(): Promise<PolicyResult> {
        throw new Error('Not implemented')
      }
    }
    createClient.mockImplementation((): Client => client)

    core.getInput
      .mockClear()
      .mockReturnValueOnce('tenant22') // tenant
      .mockReturnValueOnce('type22') // subject-type
      .mockReturnValueOnce('namespace22') // subject-namespace
      .mockReturnValueOnce('name22') // subject-name
      .mockReturnValueOnce('version22') // subject-version
      .mockReturnValueOnce('digest22') // subject-digest
      .mockReturnValueOnce('https://repo.example.com/') // subject-repository-url
      .mockReturnValueOnce('https://attest.example.com/') // attestation-client-url
      .mockReturnValueOnce('') // username
      .mockReturnValueOnce('') // password
    core.getMultilineInput
      .mockClear()
      .mockReturnValueOnce(['build-scan-id21', 'build-scan-id22']) // build-scan-ids
    await run()

    // then
    // handled by the reporter
    expect(core.setFailed).not.toHaveBeenCalled()

    // expect interactions
    expect(createClient).toHaveBeenNthCalledWith(
      1,
      'https://attest.example.com/',
      'gha-token'
    )

    expect(createPublisherReporter).toHaveBeenCalledTimes(1)
    expect(client.publishAttestation).toHaveBeenNthCalledWith(
      1,
      'tenant22',
      'type22',
      'namespace22',
      'name22',
      'version22',
      'digest22',
      'https://repo.example.com/',
      ['build-scan-id21', 'build-scan-id22'],
      []
    )

    const subject = {
      name: 'pkg:type22/namespace22/name22@version22',
      digest: { sha256: 'digest22' }
    }
    expect(mockReporter.report).toHaveBeenNthCalledWith(
      1,
      500,
      subject,
      payload
    )

    expect(core.summary.write).toHaveBeenCalled()
  })
})
