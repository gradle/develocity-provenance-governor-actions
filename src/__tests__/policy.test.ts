/**
 * Unit tests for the policy evaluation action functionality, src/policy.ts
 */
import { jest } from '@jest/globals'
import * as core from '../__fixtures__/core.js'
import { createClient } from '../__fixtures__/client.js'
import { createPolicyReporter } from '../__fixtures__/reporter.js'
// import { Client } from '../client.js'
import { Reporter } from '../reporter.js'
// import * as fs from 'node:fs'

// Mocks should be declared before the module being tested is imported.
jest.unstable_mockModule('@actions/core', () => core)
jest.unstable_mockModule('../client.js', () => ({ createClient }))
jest.unstable_mockModule('../reporter-policy.js', () => ({
  createPolicyReporter
}))

// The module being tested should be imported dynamically. This ensures that the
// mocks are used in place of any actual dependencies.
const { run } = await import('../policy.js')

const mockReporter = {
  report: jest.fn(),
  reportSuccess: jest.fn(),
  reportError: jest.fn()
}

describe('policy.ts', () => {
  beforeEach(() => {
    core.summary.emptyBuffer()
    jest.clearAllMocks()
    createPolicyReporter.mockImplementation((): Reporter => mockReporter)
    core.getIDToken.mockImplementation(
      (): Promise<string> => Promise.resolve('gha-token')
    )
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('Evaluates Policy', async () => {
    // given

    // when
    await run()

    // then
  })
})
