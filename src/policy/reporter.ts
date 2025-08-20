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
    result: PolicyErrorResponse,
    setFailure: boolean
  ): void {
    header('Policy Scan Evaluation - ⛔ Error')

    if (setFailure) {
      core.setFailed(
        `Policy scan ${subject.scanName} evaluation errored for ${subject.subjectName}`
      )
      core.error('Error response: ' + JSON.stringify(result, null, 2))
    }

    reportSubjectInfo(subject)

    reportProblemDetails(result)
  }

  reportSuccess(
    subject: PolicyRequestSubject,
    result: PolicySuccessResponse,
    setFailure: boolean
  ): void {
    const hasFailures = hasUnsatisfiedEvaluation(result.results)
    const resultText = hasFailures
      ? statusIcon(PolicyResultStatus.UNSATISFIED) + ' UNSATISFIED'
      : statusIcon(PolicyResultStatus.SATISFIED) + ' SATISFIED'

    header(`Policy Scan Evaluated - ${resultText}`)

    reportSubjectInfo(subject)

    core.summary.addRaw('**Result:** ').addRaw(resultText).addEOL().addEOL()

    reportTable(result.results)

    if (hasFailures) {
      if (setFailure) {
        core.setFailed(
          `Policy scan ${subject.scanName} evaluated to UNSATISFIED for ${subject.subjectName}`
        )
      }

      reportFailures(result.results)
    }

    reportAllResults(result.results)
  }
}

function header(heading: string) {
  //TODO make reference the policy image in repo's main branch.  Needs the repo to be public
  const headerImage =
    'https://raw.githubusercontent.com/gist/rnett/38fcc9ed1bafaa96934a788630148884/raw/52411f8f4910ba25dd44d7434644ec8dd9e79ad6/policy-header.svg'

  core.summary
    .addBreak()
    .addEOL()
    .addImage(headerImage, 'Policy Evaluator', {
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
    .addRaw('**Policy Scan:** `')
    .addRaw(subject.scanName)
    .addRaw('`')
    .addEOL()
    .addEOL()

  core.summary
    .addRaw('**Subject:** `')
    .addRaw(subject.subjectName)
    .addRaw('`')
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

function attestationName(attestation: PolicyAttestation): string {
  if (attestation.storeRequest.uri) {
    const uri = attestation.storeRequest.uri
    return uri.substring(uri.lastIndexOf('/') + 1)
  } else {
    return 'N/A'
  }
}

function reportTable(results: PolicyAttestationEvaluation[]) {
  const tableRows: SummaryTableRow[] = [
    [
      { data: 'Attestation', header: true },
      { data: 'Predicate Type', header: true },
      { data: 'Build Scan', header: true },
      { data: 'Status', header: true },
      { data: 'Satisfied Policies', header: true },
      { data: 'Unsatisfied Policies', header: true },
      { data: 'Details', header: true }
    ]
  ]

  results.forEach((result, index) => {
    const failureCount = result.evaluations.filter(
      (e) => e.status == PolicyResultStatus.UNSATISFIED
    ).length

    const successCount = result.evaluations.filter(
      (e) => e.status == PolicyResultStatus.SATISFIED
    ).length

    const status =
      failureCount > 0
        ? PolicyResultStatus.UNSATISFIED
        : PolicyResultStatus.SATISFIED

    tableRows.push([
      { data: '\n\n`' + attestationName(result.attestation) + '`\n' },
      {
        data:
          '\n\n`' + result.attestation.envelope.payload.predicateType + '`\n'
      },
      {
        data:
          '\n\n' +
          (result.attestation.envelope.payload.predicate.buildScanUri ?? '') +
          '\n'
      },
      { data: statusIcon(status) },
      { data: successCount.toString() },
      { data: failureCount.toString() },
      { data: `\n\n[Link](#attestation-detail-${index})\n` }
    ])
  })

  core.summary.addTable(tableRows).addEOL()
}

function reportFailures(results: PolicyAttestationEvaluation[]) {
  results.forEach(({ attestation, evaluations }) => {
    const hasFailure = evaluations.some(
      (e) => e.status == PolicyResultStatus.UNSATISFIED
    )

    if (!hasFailure) {
      return
    }

    // reportAttestation(
    //   attestation,
    //   `##  <a name="attestation-failure-detail-${index}"></a> Unsatisfactory Attestation`
    // )

    evaluations.forEach((evaluation) => {
      if (evaluation.status == PolicyResultStatus.UNSATISFIED) {
        core.error(
          `Attestation ${attestationName(attestation)} failed policy ${evaluation.policyUri}`
        )
        // reportFailure(attestation, evaluation)
      }
    })

    // core.summary.addEOL()
  })
}

// @ts-expect-error saving
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function reportFailure(
  attestation: PolicyAttestation,
  evaluation: PolicyEvaluation
) {
  core.summary
    .addRaw('### Unsatisfied policy `')
    .addRaw(evaluation.policyUri)
    .addRaw('`')
    .addEOL()
    .addEOL()

  if (evaluation.details.description) {
    core.summary
      .addRaw('**Description:** ')
      .addRaw(evaluation.details.description)
      .addEOL()
      .addEOL()
  }

  if (evaluation.details.remediation) {
    core.summary
      .addRaw('**Remediation:** ')
      .addRaw(evaluation.details.remediation)
      .addEOL()
      .addEOL()
  }

  core.summary.addRaw('**Labels:**').addEOL()
  for (const label in evaluation.labels) {
    core.summary
      .addRaw(' * ')
      .addRaw('`' + label + '`')
      .addRaw(' = ')
      .addRaw('`' + evaluation.labels[label] + '`')
      .addEOL()
  }

  core.summary.addEOL()

  core.summary
    .addDetails(
      'Policy Details',
      '\n\n```json\n' + JSON.stringify(evaluation.details, null, 2) + '\n```\n'
    )
    .addEOL()

  core.summary.addEOL()
}

function reportAllResults(results: PolicyAttestationEvaluation[]) {
  core.summary.addRaw('## Full results').addEOL().addEOL()

  // core.summary.addRaw('<details>').addEOL()
  //
  // core.summary.addRaw('<summary>Expand to see all results</summary>').addEOL()

  results.forEach((result, index) => {
    reportAttestation(
      result.attestation,
      `### <a name="attestation-detail-${index}"></a> Attestation`
    )

    const tableRows: SummaryTableRow[] = [
      [
        { data: 'Policy', header: true },
        { data: 'Status', header: true },
        { data: 'Description', header: true }
      ]
    ]

    result.evaluations.forEach((evaluation) => {
      tableRows.push([
        { data: `\n\n\`${evaluation.policyUri}\`\n` },
        { data: statusIcon(evaluation.status) },
        {
          data: evaluation.details.description
            ? evaluation.details.description
            : ''
        }
      ])
    })

    core.summary.addTable(tableRows).addEOL()
  })

  // core.summary.addRaw('</details>').addEOL()
}

function reportAttestation(
  attestation: PolicyAttestation,
  headerPrefix: string,
  headerPostfix: string | null = null
) {
  core.summary.addEOL().addEOL().addRaw(headerPrefix)

  core.summary.addRaw(' `').addRaw(attestationName(attestation)).addRaw('`')

  if (headerPostfix) {
    core.summary.addRaw(' ').addRaw(headerPostfix)
  }

  core.summary.addEOL().addEOL()

  core.summary
    .addRaw('**Predicate Type:** `')
    .addRaw(attestation.envelope.payload.predicateType)
    .addRaw('`')
    .addEOL()
    .addEOL()

  if (attestation.envelope.payload.predicate.buildScanUri) {
    core.summary
      .addRaw('**Build Scan:** ')
      .addRaw(attestation.envelope.payload.predicate.buildScanUri)
      .addEOL()
      .addEOL()
  }

  core.summary
    .addRaw('**Attestation Store:** `')
    .addRaw(attestation.storeUri)
    .addRaw('`')
    .addEOL()
    .addEOL()

  core.summary.addRaw('<details>').addEOL()

  core.summary
    .addRaw('<summary>Attestation Details</summary>')
    .addEOL()
    .addEOL()

  if (attestation.storeRequest.uri) {
    core.summary
      .addRaw('Attestation URI: `')
      .addRaw(attestation.storeRequest.uri)
      .addRaw('`')
      .addEOL()
      .addEOL()
  }

  core.summary
    .addRaw('Envelope:')
    .addEOL()
    .addEOL()
    .addRaw('```json')
    .addEOL()
    .addRaw(JSON.stringify(attestation.envelope, null, 2))
    .addEOL()
    .addRaw('```')
    .addEOL()
    .addEOL()

  core.summary.addRaw('</details>').addEOL().addEOL()
}

function statusIcon(status: PolicyResultStatus): string {
  switch (status) {
    case PolicyResultStatus.SATISFIED:
      return '✅'
    case PolicyResultStatus.UNSATISFIED:
      return '❌'
    case PolicyResultStatus.NOT_APPLICABLE:
      return 'N/A' //TODO why isn't this being used?
    default:
      return '❓'
  }
}
