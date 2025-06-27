import * as core from '@actions/core'
import { PackageURL } from 'packageurl-js'
import {
  FailedAttestation,
  PublishedAttestation,
  PublishErrorResult,
  PublishSuccessResult
} from './publisher-client.js'
import { SummaryTableRow } from '@actions/core/lib/summary.js'

export interface Reporter {
  reportSuccess(
    subjectPurl: PackageURL,
    digest: string,
    success?: PublishSuccessResult
  ): void
  reportError(
    subjectPurl: PackageURL,
    digest: string,
    error?: PublishErrorResult
  ): void
}

export function createReporter(): Reporter {
  return new SummaryReporter()
}

export class SummaryReporter implements Reporter {
  reportSuccess(
    subjectPurl: PackageURL,
    digest: string,
    success?: PublishSuccessResult
  ) {
    core.info(
      `Attestation publishing for subject: ${subjectPurl} completed successfully!`
    )

    header(
      'Attestations Published',
      subjectPurl.toString(),
      'https://todo.example.com', // TODO
      digest
    )

    // TODO merge this table creation with the one below
    const rows: SummaryTableRow[] = [headerRow()]
    success?.publishedAttestations?.forEach((attestation) => {
      rows.push(successRow(attestation))
    })

    core.summary.addTable(rows)
  }

  reportError(
    subjectPurl: PackageURL,
    digest: string,
    error?: PublishErrorResult
  ) {
    header(
      'Attestations Publishing Failed',
      subjectPurl.toString(),
      'https://todo.example.com', // TODO
      digest
    )

    if (error?.title) {
      core.summary.addRaw('**Error:** ').addRaw(error?.title).addEOL()
    }
    if (error?.type) {
      core.summary.addRaw('**Type:** ').addRaw(error?.type).addEOL()
    }
    if (error?.detail) {
      core.summary.addRaw(error?.detail).addEOL()
    }

    const rows: SummaryTableRow[] = [headerRow()]

    error?.publishedAttestations?.forEach((attestation) => {
      rows.push(successRow(attestation))
    })
    error?.failedAttestations?.forEach((attestation) => {
      rows.push(errorRow(attestation))
    })

    core.summary.addTable(rows)
  }
}

function header(
  heading: string,
  subjectPurl: string,
  subjectDownloadUrl: string,
  digest: string
) {
  core.summary
    .addBreak()
    .addEOL()
    .addRaw(`## ${heading}`)
    .addEOL()
    .addEOL()
    .addRaw('**Subject:** ')
    .addLink(subjectPurl.toString(), subjectDownloadUrl)
    .addEOL()
    .addRaw('**Digest:** ')
    .addRaw(digest)
    .addEOL()
}

function headerRow() {
  return [
    { data: 'Type', header: true },
    { data: 'Published', header: true },
    { data: 'Attestation', header: true }
  ]
}

function successRow(attestation: PublishedAttestation) {
  return [
    attestation.type,
    '✅',
    `\n\n[download attestation](${attestation.downloadUrl})`
  ]
}

function errorRow(attestation: FailedAttestation) {
  return [attestation.type, '❌', attestation.detail]
}
