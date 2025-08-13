import { BaseReporter, Reporter, reportProblemDetails } from './reporter.js'

import * as core from '@actions/core'
import {
  PolicyErrorResponse,
  PolicyRequestSubject,
  PolicySuccessResponse
} from './model-policy.js'

export function createPolicyReporter(): Reporter<
  PolicyRequestSubject,
  PolicySuccessResponse,
  PolicyErrorResponse
> {
  return new PolicySummaryReporter()
}

export class PolicySummaryReporter extends BaseReporter<
  PolicyRequestSubject,
  PolicySuccessResponse,
  PolicyErrorResponse
> {
  reportError(
    subject: PolicyRequestSubject,
    result: PolicyErrorResponse
  ): void {
    header('Policy Scan Evaluation Errored')

    reportSubjectInfo(subject)

    reportProblemDetails(result)
  }

  reportSuccess(
    subject: PolicyRequestSubject,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    result: PolicySuccessResponse
  ): void {
    header('Policy Scan Evaluated')

    reportSubjectInfo(subject)
  }
}

function header(heading: string) {
  const headerImage =
    'https://gist.githubusercontent.com/bdemers/18c7a0fc36b0b1c0c88260fd9e228ad1/raw/db71e3a9b8220a9ea5e855be28711990b1afdcbe/attestation-header.svg'

  core.summary
    .addBreak()
    .addEOL()
    .addImage(headerImage, 'Policy Evaluation', {
      width: '100%',
      height: 'auto'
    })
    .addEOL()
    .addRaw(`## ${heading}`)
    .addEOL()
    .addEOL()
}

function reportSubjectInfo(subject: PolicyRequestSubject) {
  core.summary.addRaw('**Policy Scan:** ').addRaw(subject.scanName).addEOL()

  core.summary.addRaw('**Subject:** ').addRaw(subject.subjectName).addEOL()

  core.summary
    .addRaw('**Digest:** `')
    .addRaw(subject.digest.sha256)
    .addRaw('`')
    .addEOL()
  core.summary.addEOL()
}
