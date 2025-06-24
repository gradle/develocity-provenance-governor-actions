/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * To mock dependencies in ESM, you can create fixtures that export mock
 * functions and objects. For example, the core module is mocked in this test,
 * so that the actual '@actions/core' module is not imported.
 */
import { jest } from '@jest/globals'
import * as core from '../__fixtures__/core.js'
import { attest } from '../__fixtures__/attest.js'

// Mocks should be declared before the module being tested is imported.
jest.unstable_mockModule('@actions/core', () => core)
jest.unstable_mockModule('../src/attest.js', () => ({ attest }))

// The module being tested should be imported dynamically. This ensures that the
// mocks are used in place of any actual dependencies.
const { run } = await import('../src/main.js')

describe('main.ts', () => {
  beforeEach(() => {
    // Set the action's inputs as return values from core.getInput().
    core.getInput.mockImplementation(() => 'oci:purl.org/example/test:1.0.0')

    // Mock the wait function so that it does not actually wait.
    attest.mockImplementation(() => Promise.resolve('done!'))
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('Creates attestation', async () => {
    core.getInput
      .mockClear()
      .mockReturnValueOnce('oci:purl.org/example/test:1.0.0')
    await run()

    // Verify the time output was set.
    expect(core.setOutput).toHaveBeenNthCalledWith(
      1,
      'status-md',
      expect.stringMatching(
        '✅ Attestation for subject: oci:purl.org/example/test:1.0.0 completed successfully!'
      )
    )
  })
})
