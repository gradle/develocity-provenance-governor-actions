import { BaseReporter, Reporter, reportProblemDetails } from '../reporter.js'

import * as core from '@actions/core'
import {
  hasUnsatisfiedEvaluation,
  PolicyAttestation,
  PolicyAttestationEvaluation,
  PolicyErrorResponse,
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

    const processedResults = preprocessResults(result.results)

    reportTable(processedResults)

    if (hasFailures) {
      if (setFailure) {
        core.setFailed(
          `Policy scan ${subject.scanName} evaluated to UNSATISFIED for ${subject.subjectName}`
        )
      }

      reportFailures(processedResults)
    }

    reportAllResults(processedResults)
  }
}

function preprocessResults(
  results: PolicyAttestationEvaluation[]
): PolicyAttestationEvaluation[] {
  return results.sort((a, b) => {
    const aUnsatisfied = a.evaluations.some(
      (e) => e.status == PolicyResultStatus.UNSATISFIED
    )
    const bUnsatisfied = b.evaluations.some(
      (e) => e.status == PolicyResultStatus.UNSATISFIED
    )

    if (aUnsatisfied && !bUnsatisfied) {
      return -1 // a first
    } else if (bUnsatisfied && !aUnsatisfied) {
      return 1 // b first
    } else {
      return a.attestation.envelope.payload.predicateType.localeCompare(
        b.attestation.envelope.payload.predicateType
      )
    }
  })
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
      // the user-content- is something needed for GitHub for the summary link to work
      { data: `\n\n[Link](#user-content-attestation-detail-${index})\n` }
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

    evaluations.forEach((evaluation) => {
      if (evaluation.status == PolicyResultStatus.UNSATISFIED) {
        core.error(
          `Attestation ${attestationName(attestation)} failed policy ${evaluation.policyUri}`
        )
      }
    })
  })
}

function reportAllResults(results: PolicyAttestationEvaluation[]) {
  core.summary.addRaw('# Details').addEOL().addEOL()

  results.forEach((result, index) => {
    reportAttestation(
      result.attestation,
      `## <a name="attestation-detail-${index}"></a> Attestation`
    )

    const tableRows: SummaryTableRow[] = [
      [
        { data: 'Policy', header: true },
        { data: 'Status', header: true },
        { data: 'Description', header: true },
        { data: 'Remediation', header: true },
        { data: 'Labels', header: true },
        { data: 'Details', header: true }
      ]
    ]

    const statusOrder = [
      PolicyResultStatus.UNSATISFIED,
      PolicyResultStatus.SATISFIED,
      PolicyResultStatus.NOT_APPLICABLE
    ]

    result.evaluations
      .sort((a, b) => {
        if (a.status == b.status) {
          return a.policyUri.localeCompare(b.policyUri)
        }

        return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status)
      })
      .forEach((evaluation) => {
        const isFailure = evaluation.status == PolicyResultStatus.UNSATISFIED
        const isNotApplicable =
          evaluation.status == PolicyResultStatus.NOT_APPLICABLE

        const policyUrl = evaluation.policyUri

        tableRows.push([
          {
            data: `\n\n\`${policyUrl.substring(policyUrl.lastIndexOf('/') + 1)}\`\n`
          },
          { data: statusIcon(evaluation.status) },
          {
            data: evaluation.details.description
              ? evaluation.details.description
              : ''
          },
          {
            data: isFailure ? (evaluation.details.remediation ?? '') : ''
          },
          {
            data: isNotApplicable
              ? ''
              : '\n\n```json\n' +
                JSON.stringify(evaluation.labels, null, 2) +
                '\n```\n'
          },
          {
            data: isNotApplicable
              ? 'Not applicable to this predicate type'
              : '\n\n```json\n' +
                JSON.stringify(evaluation.details, null, 2) +
                '\n```\n'
          }
        ])
      })

    core.summary.addRaw('**Policy Results:**').addEOL().addEOL()
    core.summary.addTable(tableRows).addEOL()
  })
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
