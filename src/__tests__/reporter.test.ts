import { jest } from '@jest/globals'
import { PackageURL } from 'packageurl-js'
import * as core from '@actions/core'

/**
 * Unit tests for src/reporter.ts
 */
import { SummaryReporter } from '../reporter.js'

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
    const subjectPurl = new PackageURL(
      'type11',
      'namespace11',
      'name11',
      'version11'
    )

    const reporter = new SummaryReporter()
    reporter.reportSuccess(subjectPurl, 'digest11', {
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
    })

    // verify the summary text looks good
    const summaryContent = await core.summary.stringify()
    expect(summaryContent).toBe(
      `<br>

## Attestations Published

**Subject:** <a href="https://todo.example.com">pkg:type11/namespace11/name11@version11</a>

**Digest:** digest11
<table><tr><th>Type</th><th>Published</th><th>Attestation</th></tr>` +
        `<tr><td>https://cavendish.dev/java-toolchain/v1</td><td>✅</td><td>

[download attestation](https://todo.example.com/attestations/java-toolchain.json)</td></tr>` +
        `<tr><td>https://cavendish.dev/npm-toolchain/v1</td><td>✅</td><td>

[download attestation](https://todo.example.com/attestations/npm-toolchain.json)</td></tr>` +
        `</table>
`
    )
  })

  it('Render a partial success report', async () => {
    const subjectPurl = new PackageURL(
      'type22',
      'namespace22',
      'name22',
      'version22'
    )

    new SummaryReporter().reportError(subjectPurl, 'digest22', {
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
    })

    // verify the summary text looks good
    const summaryContent = await core.summary.stringify()
    expect(summaryContent).toBe(
      `<br>

## Attestations Publishing Failed

**Subject:** <a href="https://todo.example.com">pkg:type22/namespace22/name22@version22</a>

**Digest:** digest22
**Error:** error-title22
**Type:** error-type22
error-detail22
<table><tr><th>Type</th><th>Published</th><th>Attestation</th></tr>` +
        `<tr><td>https://cavendish.dev/java-toolchain/v1</td><td>✅</td><td>

[download attestation](https://todo.example.com/attestations/java-toolchain.json)</td></tr>` +
        `<tr><td>https://cavendish.dev/npm-toolchain/v1</td><td>❌</td><td>Access denied to repository.</td></tr>` +
        `</table>
`
    )
  })
})
