import { jest } from '@jest/globals'
import * as core from '@actions/core'
import { PolicySummaryReporter } from '../reporter.js'
import fs from 'node:fs'

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

  it('Render a satisfied report', async () => {
    renderAndCompare('satisfied', 200)
  })

  it('Render a unsatisfied report', async () => {
    renderAndCompare('unsatisfied', 200)
  })

  it('Render a error report', async () => {
    renderAndCompare('error', 404)
  })
})

function renderAndCompare(
  fixtureName: string,
  status: number = 200,
  scanName: string = 'security-scan',
  subjectName: string = 'pkg:oci/java-payment-calculator@1.0.0-SNAPSHOT-16152750186-3',
  digest: string = 'c8d8f52ac5cd63188e705ac55dd01ee3a22f419a6b311175f84d965573af563b'
) {
  const payload = JSON.parse(
    fs.readFileSync(`src/policy/__fixtures__/${fixtureName}.json`, 'utf8')
  )
  const expectedReport = fs.readFileSync(
    `src/policy/__fixtures__/${fixtureName}.md`,
    'utf8'
  )

  new PolicySummaryReporter().report(
    status,
    { scanName, subjectName, digest: { sha256: digest } },
    payload,
    false
  )

  // verify the summary text looks good
  const summaryContent = core.summary.stringify()
  expect(summaryContent).toBe(expectedReport)
}
