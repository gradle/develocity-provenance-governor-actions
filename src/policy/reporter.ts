import { BaseReporter, Reporter, reportProblemDetails } from '../reporter.js'

import * as core from '@actions/core'
import {
  hasUnsatisfiedEvaluation,
  PolicyAttestation,
  PolicyAttestationEvaluation,
  PolicyErrorResponse,
  PolicyEvaluation,
  PolicyRequestSubject,
  PolicyResultStatus,
  PolicySuccessResponse
} from './model.js'
import { SummaryTableRow } from '@actions/core/lib/summary.js'

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
    result: PolicySuccessResponse
  ): void {
    const hasFailures = hasUnsatisfiedEvaluation(result.results)
    const resultText = hasFailures
      ? statusIcon(PolicyResultStatus.UNSATISFIED) + ' UNSATISFIED'
      : statusIcon(PolicyResultStatus.SATISFIED) + ' SATISFIED'

    header(`Policy Scan Evaluated - ${resultText}`)

    reportSubjectInfo(subject)

    core.summary.addRaw('**Result:** ').addRaw(resultText).addEOL().addEOL()

    if (hasFailures) {
      core.setFailed(
        `Policy scan ${subject.scanName} evaluated to UNSATISFIED for ${subject.subjectName}`
      )

      reportFailures(result.results)
    }

    reportAllResults(result.results)
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
    .addRaw(`# ${heading}`)
    .addEOL()
    .addEOL()
}

function reportSubjectInfo(subject: PolicyRequestSubject) {
  core.summary
    .addRaw('**Policy Scan:** ')
    .addRaw(subject.scanName)
    .addEOL()
    .addEOL()

  core.summary
    .addRaw('**Subject:** ')
    .addRaw(subject.subjectName)
    .addEOL()
    .addEOL()

  core.summary
    .addRaw('**Digest:** `')
    .addRaw(subject.digest.sha256)
    .addRaw('`')
    .addEOL()
    .addEOL()
  core.summary.addEOL()
}

function reportFailures(results: PolicyAttestationEvaluation[]) {
  results.forEach(({ attestation, evaluations }) => {
    const hasFailure = evaluations.some(
      (e) => e.status == PolicyResultStatus.UNSATISFIED
    )

    if (hasFailure) {
      core.summary
        .addEOL()
        .addEOL()
        .addRaw('## Unsatisfactory Attestation ')
        .addRaw(attestation.storeUri)
        .addEOL()
        .addEOL()
    }

    core.summary
      .addRaw('**Predicate Type:** ')
      .addRaw(attestation.envelope.payload.predicateType)
      .addEOL()
      .addEOL()

    core.summary
      .addDetails(
        'Attestation Envelope',
        '\n\n```json\n' +
          JSON.stringify(attestation.envelope, null, 2) +
          '\n```\n'
      )
      .addEOL()

    evaluations.forEach((evaluation) => {
      if (evaluation.status == PolicyResultStatus.UNSATISFIED) {
        reportFailure(attestation, evaluation)
      }
    })

    core.summary.addEOL()
  })
}

function reportFailure(
  attestation: PolicyAttestation,
  evaluation: PolicyEvaluation
) {
  core.error(
    `Attestation ${attestation.storeUri} failed policy ${evaluation.policyUri}`
  )
  core.summary
    .addRaw('### Unsatisfied policy ')
    .addRaw(evaluation.policyUri)
    .addEOL()
    .addEOL()

  if (evaluation.description) {
    core.summary
      .addRaw('**Description:** ')
      .addRaw(evaluation.description)
      .addEOL()
      .addEOL()
  }

  if (evaluation.remediation) {
    core.summary
      .addRaw('**Remediation:** ')
      .addRaw(evaluation.remediation)
      .addEOL()
      .addEOL()
  }

  core.summary.addRaw('**Labels:** ').addEOL()
  for (const label in evaluation.labels) {
    core.summary
      .addRaw(' * ')
      .addRaw('`' + label + '`')
      .addRaw(' = ')
      .addRaw('`' + evaluation.labels[label] + '`')
      .addEOL()
  }
  core.summary.addEOL()
}

function reportAllResults(results: PolicyAttestationEvaluation[]) {
  core.summary.addRaw('## Full results').addEOL().addEOL()

  core.summary.addRaw('<details>').addEOL()

  core.summary.addRaw('<summary>Expand to see all results</summary>').addEOL()

  results.forEach((result) => {
    core.summary
      .addEOL()
      .addEOL()
      .addRaw('### Attestation ')
      .addRaw(result.attestation.storeUri)
      .addEOL()
      .addEOL()

    core.summary
      .addRaw('**Predicate Type:** ')
      .addRaw(result.attestation.envelope.payload.predicateType)
      .addEOL()
      .addEOL()

    core.summary
      .addDetails(
        'Envelope',
        '\n\n```json\n' +
          JSON.stringify(result.attestation.envelope, null, 2) +
          '\n```\n'
      )
      .addEOL()

    const tableRoes: SummaryTableRow[] = [
      [
        { data: 'Policy', header: true },
        { data: 'Status', header: true },
        { data: 'Description', header: true }
      ]
    ]

    result.evaluations.forEach((evaluation) => {
      tableRoes.push([
        { data: evaluation.policyUri },
        { data: statusIcon(evaluation.status) },
        {
          data: evaluation.description
            ? evaluation.description
            : 'No description provided'
        }
      ])
    })

    core.summary.addTable(tableRoes).addEOL()
  })

  core.summary.addRaw('</details>').addEOL()
}

function statusIcon(status: PolicyResultStatus): string {
  switch (status) {
    case PolicyResultStatus.SATISFIED:
      return '✅'
    case PolicyResultStatus.UNSATISFIED:
      return '❌'
    case PolicyResultStatus.UNSUPPORTED_PREDICATE_TYPE:
      return 'N/A'
    default:
      return '❓'
  }
}
