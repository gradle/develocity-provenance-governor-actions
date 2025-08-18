import { jest } from '@jest/globals'
import * as core from '../../__fixtures__/core.js'
import fs from 'node:fs'

// Mock the core module before importing the reporter
jest.unstable_mockModule('@actions/core', () => core)

// Import the reporter after mocking
const { PublisherSummaryReporter } = await import('../reporter.js')

/**
 * Unit tests for src/reporter.ts
 */
describe('reporter.js', () => {
  beforeEach(() => {
    core.summary.emptyBuffer()
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.resetAllMocks()
    core.summary.emptyBuffer()
  })

  it('Render a success report', async () => {
    renderAndCompare('success', 200)
  })

  it('Render a partial success report', async () => {
    renderAndCompare('partial-error', 400)
  })

  it('Render a failure report', async () => {
    renderAndCompare('error', 404)
  })

  it('Calls core.setFailed and core.error on error report with setFailure=true', async () => {
    const payload = JSON.parse(
      fs.readFileSync('src/publish/__fixtures__/error.json', 'utf8')
    )
    const subject = {
      name: 'pkg:oci/java-payment-calculator@1.0.0-SNAPSHOT-16152750186-3',
      digest: {
        sha256:
          'c8d8f52ac5cd63188e705ac55dd01ee3a22f419a6b311175f84d965573af563b'
      }
    }

    new PublisherSummaryReporter().report(404, subject, payload, true)

    expect(core.setFailed).toHaveBeenCalledWith(
      'Attestation publishing for subject pkg:oci/java-payment-calculator@1.0.0-SNAPSHOT-16152750186-3 errored'
    )
    expect(core.error).toHaveBeenCalledWith(
      'Error response: ' + JSON.stringify(payload, null, 2)
    )
  })

  it('Calls core.setFailed and core.error on partial error report with setFailure=true', async () => {
    const payload = JSON.parse(
      fs.readFileSync('src/publish/__fixtures__/partial-error.json', 'utf8')
    )
    const subject = {
      name: 'pkg:oci/java-payment-calculator@1.0.0-SNAPSHOT-16152750186-3',
      digest: {
        sha256:
          'c8d8f52ac5cd63188e705ac55dd01ee3a22f419a6b311175f84d965573af563b'
      }
    }

    new PublisherSummaryReporter().report(400, subject, payload, true)

    expect(core.setFailed).toHaveBeenCalledWith(
      'Attestation publishing for subject pkg:oci/java-payment-calculator@1.0.0-SNAPSHOT-16152750186-3 errored'
    )
    expect(core.error).toHaveBeenCalledWith(
      'Error response: ' + JSON.stringify(payload, null, 2)
    )
  })

  it('Does not call core.setFailed on success report', async () => {
    const payload = JSON.parse(
      fs.readFileSync('src/publish/__fixtures__/success.json', 'utf8')
    )
    const subject = {
      name: 'pkg:oci/java-payment-calculator@1.0.0-SNAPSHOT-16152750186-3',
      digest: {
        sha256:
          'c8d8f52ac5cd63188e705ac55dd01ee3a22f419a6b311175f84d965573af563b'
      }
    }

    new PublisherSummaryReporter().report(200, subject, payload, true)

    expect(core.setFailed).not.toHaveBeenCalled()
    expect(core.error).not.toHaveBeenCalled()
  })
})

function renderAndCompare(
  fixtureName: string,
  status: number = 200,
  subjectName: string = 'pkg:oci/java-payment-calculator@1.0.0-SNAPSHOT-16152750186-3',
  digest: string = 'c8d8f52ac5cd63188e705ac55dd01ee3a22f419a6b311175f84d965573af563b'
) {
  const payload = JSON.parse(
    fs.readFileSync(`src/publish/__fixtures__/${fixtureName}.json`, 'utf8')
  )
  const expectedReport = fs.readFileSync(
    `src/publish/__fixtures__/${fixtureName}.md`,
    'utf8'
  )

  new PublisherSummaryReporter().report(
    status,
    { name: subjectName, digest: { sha256: digest } },
    payload,
    false
  )

  // verify the summary text looks good
  const summaryContent = core.summary.stringify()
  expect(summaryContent).toBe(expectedReport)
}
