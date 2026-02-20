import { jest } from '@jest/globals'
import * as core from '../../__fixtures__/core.js'
import fs from 'node:fs'

// Mock the core module before importing the reporter
jest.unstable_mockModule('@actions/core', () => core)

// Import the reporter after mocking
const { PolicySummaryReporter } = await import('../reporter.js')

/**
 * Unit tests for src/policy/reporter.ts
 */
describe('policy reporter.js', () => {
  beforeEach(() => {
    core.summary.emptyBuffer()
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.resetAllMocks()
    core.summary.emptyBuffer()
  })

  it('Render a satisfied policy scan report', async () => {
    renderAndCompare('satisfied', 200)
  })

  it('Render a unsatisfied policy scan report', async () => {
    renderAndCompare('unsatisfied', 200)
  })

  it('Render a error policy scan report', async () => {
    renderAndCompare('error', 404)
  })

  it('Render a satisfied evaluation point report', async () => {
    renderAndCompare(
      'satisfied-enforcement-point',
      200,
      'test-enforcement-point'
    )
  })

  it('Render a unsatisfied enforcement point report', async () => {
    renderAndCompare(
      'unsatisfied-enforcement-point',
      200,
      'test-enforcement-point'
    )
  })

  it('Render a error enforcement point report', async () => {
    renderAndCompare('error-enforcement-point', 404, 'test-enforcement-point')
  })

  it('Calls core.setFailed and core.error on error report with setFailure=true', async () => {
    const payload = JSON.parse(
      fs.readFileSync('src/policy/__fixtures__/error.json', 'utf8')
    )
    const subject = {
      scanName: 'security-scan',
      enforcementPointName: 'test-enforcement-point',
      subjectName:
        'pkg:oci/java-payment-calculator@1.0.0-SNAPSHOT-16152750186-3',
      digest: {
        sha256:
          'c8d8f52ac5cd63188e705ac55dd01ee3a22f419a6b311175f84d965573af563b'
      }
    }

    new PolicySummaryReporter().report(404, subject, payload, true)

    expect(core.setFailed).toHaveBeenCalledWith(
      'Policy scan security-scan evaluation errored for pkg:oci/java-payment-calculator@1.0.0-SNAPSHOT-16152750186-3'
    )
    expect(core.error).toHaveBeenCalledWith(
      'Error response: ' + JSON.stringify(payload, null, 2)
    )
  })

  it('Calls core.setFailed on unsatisfied report with setFailure=true', async () => {
    const payload = JSON.parse(
      fs.readFileSync('src/policy/__fixtures__/unsatisfied.json', 'utf8')
    )
    const subject = {
      scanName: 'security-scan',
      enforcementPointName: 'test-enforcement-point',
      subjectName:
        'pkg:oci/java-payment-calculator@1.0.0-SNAPSHOT-16152750186-3',
      digest: {
        sha256:
          'c8d8f52ac5cd63188e705ac55dd01ee3a22f419a6b311175f84d965573af563b'
      }
    }

    new PolicySummaryReporter().report(200, subject, payload, true)

    expect(core.setFailed).toHaveBeenCalledWith(
      'Policy scan security-scan evaluated to UNSATISFIED for pkg:oci/java-payment-calculator@1.0.0-SNAPSHOT-16152750186-3'
    )
    // Should also call core.error for each unsatisfied policy
    expect(core.error).toHaveBeenCalled()
  })

  it('Does not call core.setFailed on satisfied report', async () => {
    const payload = JSON.parse(
      fs.readFileSync('src/policy/__fixtures__/satisfied.json', 'utf8')
    )
    const subject = {
      scanName: 'security-scan',
      enforcementPointName: 'test-enforcement-point',
      subjectName:
        'pkg:oci/java-payment-calculator@1.0.0-SNAPSHOT-16152750186-3',
      digest: {
        sha256:
          'c8d8f52ac5cd63188e705ac55dd01ee3a22f419a6b311175f84d965573af563b'
      }
    }

    new PolicySummaryReporter().report(200, subject, payload, true)

    expect(core.setFailed).not.toHaveBeenCalled()
    expect(core.error).not.toHaveBeenCalled()
  })
})

function renderAndCompare(
  fixtureName: string,
  status: number = 200,
  enforcementPointName: string | undefined = undefined,
  scanName: string = 'security-scan',
  subjectName: string = 'pkg:oci/java-payment-calculator@1.0.0-SNAPSHOT-16152750186-3',
  digest: string = 'c8d8f52ac5cd63188e705ac55dd01ee3a22f419a6b311175f84d965573af563b'
) {
  const payload = JSON.parse(
    fs.readFileSync(`src/policy/__fixtures__/${fixtureName}.json`, 'utf8')
  )
  const expectedReportPath = `src/policy/__fixtures__/${fixtureName}.md`
  const expectedReport = fs.readFileSync(expectedReportPath, 'utf8')

  new PolicySummaryReporter().report(
    status,
    {
      scanName,
      enforcementPointName,
      subjectName,
      digest: { sha256: digest }
    },
    payload,
    false
  )

  // verify the summary text looks good
  const summaryContent = core.summary.stringify()

  if (process.env.UPDATE_FIXTURES === '1') {
    fs.writeFileSync(expectedReportPath, summaryContent)
  }

  expect(summaryContent).toBe(expectedReport)
}
