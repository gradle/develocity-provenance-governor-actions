/**
 * Unit tests for the action's main functionality, src/policy/main.ts
 *
 * To mock dependencies in ESM, you can create fixtures that export mock
 * functions and objects. For example, the core module is mocked in this test,
 * so that the actual '@actions/core' module is not imported.
 */
import { jest } from '@jest/globals'
import * as core from '../../__fixtures__/core.js'
import { createClient } from '../../__fixtures__/client.js'
import { createPolicyReporter } from '../../__fixtures__/reporter.js'
import { Client, PolicyResult, PublisherResult } from '../../client.js'
import { Reporter } from '../../reporter.js'
import * as fs from 'node:fs'

// Mocks should be declared before the module being tested is imported.
jest.unstable_mockModule('@actions/core', () => core)
jest.unstable_mockModule('../../client.js', () => ({ createClient }))
jest.unstable_mockModule('../reporter.js', () => ({
  createPolicyReporter
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
    createPolicyReporter.mockImplementation(
      (): Reporter<never, never, never> => mockReporter
    )
    core.getIDToken.mockImplementation(
      (): Promise<string> => Promise.resolve('gha-token')
    )
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('Evaluates policy with satisfied result', async () => {
    // given
    const payload = JSON.parse(
      fs.readFileSync('src/policy/__fixtures__/satisfied.json', 'utf8')
    )

    const client: Client = {
      publishAttestation(): Promise<PublisherResult> {
        throw new Error('Not implemented')
      },
      evaluatePolicy: jest.fn(() =>
        Promise.resolve(new PolicyResult(200, true, payload))
      )
    }

    createClient.mockImplementation((): Client => client)

    core.getInput
      .mockClear()
      .mockReturnValueOnce('https://policy.example.com/') // policy-evaluator-url
      .mockReturnValueOnce('security-scan') // policy-scan
      .mockReturnValueOnce('test-enforcement-point') // enforcement-point
      .mockReturnValueOnce('oci') // subject-type
      .mockReturnValueOnce('') // subject-namespace
      .mockReturnValueOnce('java-payment-calculator') // subject-name
      .mockReturnValueOnce('1.0.0-SNAPSHOT-16152750186-3') // subject-version
      .mockReturnValueOnce(
        'c8d8f52ac5cd63188e705ac55dd01ee3a22f419a6b311175f84d965573af563b'
      ) // subject-digest
      .mockReturnValueOnce('https://repo.example.com/') // subject-repository-url
      .mockReturnValueOnce('') // username
      .mockReturnValueOnce('') // password

    // when
    await run()

    // then
    // check error first, if something went wrong, fail fast
    expect(core.setFailed).not.toHaveBeenCalled()

    // expect interactions
    expect(createClient).toHaveBeenNthCalledWith(
      1,
      'https://policy.example.com/',
      'gha-token'
    )

    expect(createPolicyReporter).toHaveBeenCalledTimes(1)
    expect(client.evaluatePolicy).toHaveBeenNthCalledWith(
      1,
      'security-scan',
      'test-enforcement-point',
      expect.objectContaining({
        type: 'oci',
        name: 'java-payment-calculator',
        version: '1.0.0-SNAPSHOT-16152750186-3'
      }),
      'c8d8f52ac5cd63188e705ac55dd01ee3a22f419a6b311175f84d965573af563b',
      'https://repo.example.com/'
    )

    const expectedSubject = {
      scanName: 'security-scan',
      enforcementPointName: 'test-enforcement-point',
      subjectName:
        'pkg:oci/java-payment-calculator@1.0.0-SNAPSHOT-16152750186-3',
      digest: {
        sha256:
          'c8d8f52ac5cd63188e705ac55dd01ee3a22f419a6b311175f84d965573af563b'
      }
    }
    expect(mockReporter.report).toHaveBeenNthCalledWith(
      1,
      200,
      expectedSubject,
      payload
    )

    expect(core.summary.write).toHaveBeenCalled()
  })

  it('Evaluates policy with unsatisfied result', async () => {
    // given
    const payload = JSON.parse(
      fs.readFileSync('src/policy/__fixtures__/unsatisfied.json', 'utf8')
    )

    const client: Client = {
      publishAttestation(): Promise<PublisherResult> {
        throw new Error('Not implemented')
      },
      evaluatePolicy: jest.fn(() =>
        Promise.resolve(new PolicyResult(200, true, payload))
      )
    }

    createClient.mockImplementation((): Client => client)

    core.getInput
      .mockClear()
      .mockReturnValueOnce('https://policy.example.com/') // policy-evaluator-url
      .mockReturnValueOnce('security-scan') // policy-scan
      .mockReturnValueOnce('test-enforcement-point') // enforcement-point
      .mockReturnValueOnce('oci') // subject-type
      .mockReturnValueOnce('') // subject-namespace
      .mockReturnValueOnce('java-payment-calculator') // subject-name
      .mockReturnValueOnce('1.0.0-SNAPSHOT-16152750186-3') // subject-version
      .mockReturnValueOnce(
        'c8d8f52ac5cd63188e705ac55dd01ee3a22f419a6b311175f84d965573af563b'
      ) // subject-digest
      .mockReturnValueOnce('https://repo.example.com/') // subject-repository-url
      .mockReturnValueOnce('') // username
      .mockReturnValueOnce('') // password

    // when
    await run()

    // then
    // check error first, if something went wrong, fail fast
    expect(core.setFailed).not.toHaveBeenCalled()

    // expect interactions
    expect(createClient).toHaveBeenNthCalledWith(
      1,
      'https://policy.example.com/',
      'gha-token'
    )

    expect(createPolicyReporter).toHaveBeenCalledTimes(1)
    expect(client.evaluatePolicy).toHaveBeenNthCalledWith(
      1,
      'security-scan',
      'test-enforcement-point',
      expect.objectContaining({
        type: 'oci',
        name: 'java-payment-calculator',
        version: '1.0.0-SNAPSHOT-16152750186-3'
      }),
      'c8d8f52ac5cd63188e705ac55dd01ee3a22f419a6b311175f84d965573af563b',
      'https://repo.example.com/'
    )

    const expectedSubject = {
      scanName: 'security-scan',
      enforcementPointName: 'test-enforcement-point',
      subjectName:
        'pkg:oci/java-payment-calculator@1.0.0-SNAPSHOT-16152750186-3',
      digest: {
        sha256:
          'c8d8f52ac5cd63188e705ac55dd01ee3a22f419a6b311175f84d965573af563b'
      }
    }
    expect(mockReporter.report).toHaveBeenNthCalledWith(
      1,
      200,
      expectedSubject,
      payload
    )

    expect(core.summary.write).toHaveBeenCalled()
  })

  it('Handles policy evaluation error', async () => {
    // given
    const payload = JSON.parse(
      fs.readFileSync('src/policy/__fixtures__/error.json', 'utf8')
    )

    const client: Client = {
      publishAttestation(): Promise<PublisherResult> {
        throw new Error('Not implemented')
      },
      evaluatePolicy: jest.fn(() =>
        Promise.resolve(new PolicyResult(404, false, payload))
      )
    }

    createClient.mockImplementation((): Client => client)

    core.getInput
      .mockClear()
      .mockReturnValueOnce('https://policy.example.com/') // policy-evaluator-url
      .mockReturnValueOnce('security-scan') // policy-scan
      .mockReturnValueOnce('test-enforcement-point') // enforcement-point
      .mockReturnValueOnce('oci') // subject-type
      .mockReturnValueOnce('') // subject-namespace
      .mockReturnValueOnce('java-payment-calculator') // subject-name
      .mockReturnValueOnce('1.0.0-SNAPSHOT-16152750186-3') // subject-version
      .mockReturnValueOnce(
        'c8d8f52ac5cd63188e705ac55dd01ee3a22f419a6b311175f84d965573af563b'
      ) // subject-digest
      .mockReturnValueOnce('https://repo.example.com/') // subject-repository-url
      .mockReturnValueOnce('') // username
      .mockReturnValueOnce('') // password

    // when
    await run()

    // then
    // expect interactions
    expect(createClient).toHaveBeenNthCalledWith(
      1,
      'https://policy.example.com/',
      'gha-token'
    )

    expect(createPolicyReporter).toHaveBeenCalledTimes(1)
    expect(client.evaluatePolicy).toHaveBeenNthCalledWith(
      1,
      'security-scan',
      'test-enforcement-point',
      expect.objectContaining({
        type: 'oci',
        name: 'java-payment-calculator',
        version: '1.0.0-SNAPSHOT-16152750186-3'
      }),
      'c8d8f52ac5cd63188e705ac55dd01ee3a22f419a6b311175f84d965573af563b',
      'https://repo.example.com/'
    )

    const expectedSubject = {
      scanName: 'security-scan',
      enforcementPointName: 'test-enforcement-point',
      subjectName:
        'pkg:oci/java-payment-calculator@1.0.0-SNAPSHOT-16152750186-3',
      digest: {
        sha256:
          'c8d8f52ac5cd63188e705ac55dd01ee3a22f419a6b311175f84d965573af563b'
      }
    }
    expect(mockReporter.report).toHaveBeenNthCalledWith(
      1,
      404,
      expectedSubject,
      payload
    )

    expect(core.summary.write).toHaveBeenCalled()
  })

  it('Handles policy evaluation with namespace', async () => {
    // given
    const payload = JSON.parse(
      fs.readFileSync('src/policy/__fixtures__/satisfied.json', 'utf8')
    )

    const client: Client = {
      publishAttestation(): Promise<PublisherResult> {
        throw new Error('Not implemented')
      },
      evaluatePolicy: jest.fn(() =>
        Promise.resolve(new PolicyResult(200, true, payload))
      )
    }

    createClient.mockImplementation((): Client => client)

    core.getInput
      .mockClear()
      .mockReturnValueOnce('https://policy.example.com/') // policy-evaluator-url
      .mockReturnValueOnce('security-scan') // policy-scan
      .mockReturnValueOnce('test-enforcement-point') // enforcement-point
      .mockReturnValueOnce('maven') // subject-type
      .mockReturnValueOnce('com.example') // subject-namespace
      .mockReturnValueOnce('my-library') // subject-name
      .mockReturnValueOnce('2.1.0') // subject-version
      .mockReturnValueOnce('abc123def456') // subject-digest
      .mockReturnValueOnce('https://repo.maven.apache.org/maven2/') // subject-repository-url
      .mockReturnValueOnce('') // username
      .mockReturnValueOnce('') // password

    // when
    await run()

    // then
    // handled by the reporter
    expect(core.setFailed).not.toHaveBeenCalled()

    // expect interactions
    expect(createClient).toHaveBeenNthCalledWith(
      1,
      'https://policy.example.com/',
      'gha-token'
    )

    expect(createPolicyReporter).toHaveBeenCalledTimes(1)
    expect(client.evaluatePolicy).toHaveBeenNthCalledWith(
      1,
      'security-scan',
      'test-enforcement-point',
      expect.objectContaining({
        type: 'maven',
        namespace: 'com.example',
        name: 'my-library',
        version: '2.1.0'
      }),
      'abc123def456',
      'https://repo.maven.apache.org/maven2/'
    )

    const expectedSubject = {
      scanName: 'security-scan',
      enforcementPointName: 'test-enforcement-point',
      subjectName: 'pkg:maven/com.example/my-library@2.1.0',
      digest: { sha256: 'abc123def456' }
    }
    expect(mockReporter.report).toHaveBeenNthCalledWith(
      1,
      200,
      expectedSubject,
      payload
    )

    expect(core.summary.write).toHaveBeenCalled()
  })

  it('Handles policy evaluation with username/password credentials', async () => {
    // given
    const payload = JSON.parse(
      fs.readFileSync('src/policy/__fixtures__/satisfied.json', 'utf8')
    )

    const client: Client = {
      publishAttestation(): Promise<PublisherResult> {
        throw new Error('Not implemented')
      },
      evaluatePolicy: jest.fn(() =>
        Promise.resolve(new PolicyResult(200, true, payload))
      )
    }

    createClient.mockImplementation((): Client => client)

    core.getInput
      .mockClear()
      .mockReturnValueOnce('https://policy.example.com/') // policy-evaluator-url
      .mockReturnValueOnce('compliance-scan') // policy-scan
      .mockReturnValueOnce('test-enforcement-point') // enforcement-point
      .mockReturnValueOnce('npm') // subject-type
      .mockReturnValueOnce('@company') // subject-namespace
      .mockReturnValueOnce('my-package') // subject-name
      .mockReturnValueOnce('1.2.3') // subject-version
      .mockReturnValueOnce('xyz789abc123') // subject-digest
      .mockReturnValueOnce('https://registry.npmjs.org/') // subject-repository-url
      .mockReturnValueOnce('testuser') // username
      .mockReturnValueOnce('testpass') // password

    // when
    await run()

    // then
    // handled by the reporter
    expect(core.setFailed).not.toHaveBeenCalled()

    // expect interactions
    expect(createClient).toHaveBeenNthCalledWith(
      1,
      'https://policy.example.com/',
      { username: 'testuser', password: 'testpass' }
    )

    expect(createPolicyReporter).toHaveBeenCalledTimes(1)
    expect(client.evaluatePolicy).toHaveBeenNthCalledWith(
      1,
      'compliance-scan',
      'test-enforcement-point',
      expect.objectContaining({
        type: 'npm',
        namespace: '@company',
        name: 'my-package',
        version: '1.2.3'
      }),
      'xyz789abc123',
      'https://registry.npmjs.org/'
    )

    const expectedSubject = {
      scanName: 'compliance-scan',
      enforcementPointName: 'test-enforcement-point',
      subjectName: 'pkg:npm/%40company/my-package@1.2.3',
      digest: { sha256: 'xyz789abc123' }
    }
    expect(mockReporter.report).toHaveBeenNthCalledWith(
      1,
      200,
      expectedSubject,
      payload
    )

    expect(core.summary.write).toHaveBeenCalled()
    expect(core.getIDToken).not.toHaveBeenCalled()
  })

  it('Handles policy evaluation without enforcement point parameter', async () => {
    // given
    const payload = JSON.parse(
      fs.readFileSync('src/policy/__fixtures__/satisfied.json', 'utf8')
    )

    const client: Client = {
      publishAttestation(): Promise<PublisherResult> {
        throw new Error('Not implemented')
      },
      evaluatePolicy: jest.fn(() =>
        Promise.resolve(new PolicyResult(200, true, payload))
      )
    }

    createClient.mockImplementation((): Client => client)

    core.getInput
      .mockClear()
      .mockReturnValueOnce('https://policy.example.com/') // policy-evaluator-url
      .mockReturnValueOnce('security-scan') // policy-scan
      .mockReturnValueOnce('') // enforcement-point (empty string)
      .mockReturnValueOnce('oci') // subject-type
      .mockReturnValueOnce('') // subject-namespace
      .mockReturnValueOnce('java-payment-calculator') // subject-name
      .mockReturnValueOnce('1.0.0-SNAPSHOT-16152750186-3') // subject-version
      .mockReturnValueOnce(
        'c8d8f52ac5cd63188e705ac55dd01ee3a22f419a6b311175f84d965573af563b'
      ) // subject-digest
      .mockReturnValueOnce('https://repo.example.com/') // subject-repository-url
      .mockReturnValueOnce('') // username
      .mockReturnValueOnce('') // password

    // when
    await run()

    // then
    // check error first, if something went wrong, fail fast
    expect(core.setFailed).not.toHaveBeenCalled()

    // expect interactions
    expect(createClient).toHaveBeenNthCalledWith(
      1,
      'https://policy.example.com/',
      'gha-token'
    )

    expect(createPolicyReporter).toHaveBeenCalledTimes(1)
    expect(client.evaluatePolicy).toHaveBeenNthCalledWith(
      1,
      'security-scan',
      null, // null enforcement point (empty string converted to null)
      expect.objectContaining({
        type: 'oci',
        name: 'java-payment-calculator',
        version: '1.0.0-SNAPSHOT-16152750186-3'
      }),
      'c8d8f52ac5cd63188e705ac55dd01ee3a22f419a6b311175f84d965573af563b',
      'https://repo.example.com/'
    )

    const expectedSubject = {
      scanName: 'security-scan',
      enforcementPointName: undefined, // undefined enforcement point (null converted to undefined in constructor)
      subjectName:
        'pkg:oci/java-payment-calculator@1.0.0-SNAPSHOT-16152750186-3',
      digest: {
        sha256:
          'c8d8f52ac5cd63188e705ac55dd01ee3a22f419a6b311175f84d965573af563b'
      }
    }
    expect(mockReporter.report).toHaveBeenNthCalledWith(
      1,
      200,
      expectedSubject,
      payload
    )

    expect(core.summary.write).toHaveBeenCalled()
  })
})
