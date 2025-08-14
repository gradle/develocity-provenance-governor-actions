import { jest } from '@jest/globals'
import * as core from '@actions/core'
import { PublisherSummaryReporter } from '../reporter.js'
import fs from 'node:fs'

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
    payload
  )

  // verify the summary text looks good
  const summaryContent = core.summary.stringify()
  expect(summaryContent).toBe(expectedReport)
}
