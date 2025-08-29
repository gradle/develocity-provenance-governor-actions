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

    const processedResults = preprocessResults(result.results)

    const policies = collectPolicyEvaluations(processedResults)

    reportPolicyTable(policies)

    // reportTable(processedResults)
    //
    if (hasFailures) {
      if (setFailure) {
        core.setFailed(
          `Policy scan ${subject.scanName} evaluated to UNSATISFIED for ${subject.subjectName}`
        )
      }
      reportFailedPolicyDetails(policies)
      //
      //   reportFailures(processedResults)
    }
    //
    // reportAllResults(processedResults)
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

  if (subject.enforcementPointName) {
    core.summary
      .addRaw('**Enforcement Point:** `')
      .addRaw(subject.enforcementPointName)
      .addRaw('`')
      .addEOL()
      .addEOL()
  }

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

function reportPolicyTable(policies: PolicyEvaluations[]) {
  const tableRows: SummaryTableRow[] = [
    [
      { data: 'Policy', header: true },
      { data: 'Status', header: true },
      { data: 'Attestations Passed / Evaluated', header: true },
      { data: 'Description', header: true },
      { data: 'Remediation', header: true },
      { data: 'Failure Details', header: true }
    ]
  ]

  policies.forEach((evaluations, index) => {
    tableRows.push([
      {
        data: `\n\n\`${evaluations.policy.name()}\`\n`
      },
      { data: statusIcon(evaluations.status) },
      {
        data:
          evaluations.successes.length +
          ' / ' +
          evaluations.totalApplicableAttestations
      },
      { data: evaluations.policy.description ?? '' },
      {
        data:
          evaluations.status == PolicyResultStatus.UNSATISFIED
            ? (evaluations.policy.remediation ?? '')
            : ''
      },
      {
        data:
          evaluations.status == PolicyResultStatus.UNSATISFIED
            ? `\n\n[Link](#user-content-policy-detail-${index})\n`
            : ''
      }
    ])
  })
  core.summary.addTable(tableRows).addEOL().addEOL()
}

function reportFailedPolicyDetails(policies: PolicyEvaluations[]) {
  core.summary.addRaw('# Failed Policies').addEOL().addEOL()

  policies.forEach((policyEval, index) => {
    if (policyEval.status == PolicyResultStatus.UNSATISFIED) {
      core.summary
        .addRaw('## <a name="policy-detail-' + index + '"></a> Policy ')
        .addRaw('`')
        .addRaw(policyEval.policy.name())
        .addRaw('`')
        .addEOL()
        .addEOL()

      core.summary
        .addRaw('**Description:** ')
        .addRaw(policyEval.policy.description ?? '')
        .addEOL()
        .addEOL()

      core.summary
        .addRaw('**Remediation:** ')
        .addRaw(policyEval.policy.remediation ?? '')
        .addEOL()
        .addEOL()

      core.summary.addRaw('**Labels:**').addEOL().addEOL()

      Object.entries(policyEval.policy.labels).forEach(([key, value]) => {
        core.summary.addRaw(' - `' + key + '` = `' + value + '`').addEOL()
      })

      core.summary.addEOL().addEOL()

      const tableRows: SummaryTableRow[] = [
        [
          { data: 'Attestation', header: true },
          { data: 'Status', header: true },
          { data: 'Details', header: true },
          { data: 'Build Scan', header: true },
          { data: 'Envelope', header: true },
          { data: 'Download Link', header: true }
        ]
      ]

      policyEval.failures.concat(policyEval.successes).forEach((evaluation) => {
        const attestation = evaluation.attestation

        const {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          description: unused,
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          remediation: unused2,
          ...otherDetails
        } = evaluation.evaluation.details

        const otherDetailsJson = JSON.stringify(otherDetails, null, 2)

        if (evaluation.evaluation.status == PolicyResultStatus.UNSATISFIED) {
          core.error(
            'Policy ' +
              policyEval.policy.name() +
              ' on attestation ' +
              attestationName(attestation) +
              ' evaluated to UNSATISFIED'
          )
        }

        const buildScanUri = attestation.envelope.payload.predicate.buildScanUri

        tableRows.push([
          {
            data: `\n\n\`${attestationName(attestation)}\`\n`
          },
          { data: statusIcon(evaluation.evaluation.status) },
          {
            data:
              otherDetailsJson != '{}'
                ? '\n\n```json\n' + otherDetailsJson + '\n```\n'
                : ''
          },
          {
            data: buildScanUri ? `\n\n[Build Scan](${buildScanUri})\n` : ''
          },
          {
            data:
              '\n\n<details>\n\n<summary>Envelope</summary>\n\n' +
              '\n\n```json\n' +
              JSON.stringify(attestation.envelope, null, 2) +
              '\n```\n' +
              '\n\n</details>\n'
          },
          {
            data:
              attestation.storeRequest.uri != null
                ? `\n\n[Download Link](${attestation.storeRequest.uri})\n`
                : ''
          }
        ])
      })
      core.summary.addTable(tableRows).addEOL().addEOL()
    }
  })
}

class PolicyEvaluations {
  policy: PolicyData
  evaluations: AttestationEvaluation[]

  failures: AttestationEvaluation[]
  successes: AttestationEvaluation[]
  status: PolicyResultStatus

  totalApplicableAttestations: number

  constructor(policy: PolicyData, evaluations: AttestationEvaluation[]) {
    this.policy = policy
    this.evaluations = evaluations

    this.failures = evaluations.filter(
      (e) => e.evaluation.status == PolicyResultStatus.UNSATISFIED
    )
    this.successes = evaluations.filter(
      (e) => e.evaluation.status == PolicyResultStatus.SATISFIED
    )
    if (this.failures.length > 0) {
      this.status = PolicyResultStatus.UNSATISFIED
    } else if (this.successes.length > 0) {
      this.status = PolicyResultStatus.SATISFIED
    } else {
      this.status = PolicyResultStatus.NOT_APPLICABLE
    }
    this.totalApplicableAttestations =
      this.successes.length + this.failures.length
  }
}

class PolicyData {
  uri: string
  description?: string
  remediation?: string
  labels: Record<string, string>

  constructor(
    uri: string,
    description: string | undefined,
    remediation: string | undefined,
    labels: Record<string, string>
  ) {
    this.uri = uri
    this.description = description
    this.remediation = remediation
    this.labels = labels
  }

  name(): string {
    return this.uri.substring(this.uri.lastIndexOf('/') + 1)
  }
}

class AttestationEvaluation {
  attestation: PolicyAttestation
  evaluation: PolicyEvaluation

  constructor(attestation: PolicyAttestation, evaluation: PolicyEvaluation) {
    this.attestation = attestation
    this.evaluation = evaluation
  }
}

function collectPolicyEvaluations(
  results: PolicyAttestationEvaluation[]
): PolicyEvaluations[] {
  const policyMap = new Map<
    string,
    { policy: PolicyData; evaluations: AttestationEvaluation[] }
  >()

  results.forEach((a: PolicyAttestationEvaluation) => {
    a.evaluations.forEach((evaluation) => {
      const status = <PolicyResultStatus>evaluation.status?.toLowerCase()

      if (!Object.values(PolicyResultStatus).includes(status)) {
        core.error('Unknown status in response: ' + evaluation.status)
        throw Error(`Unknown status in response: ${evaluation.status}`)
      }
      evaluation.status = status

      const data = new PolicyData(
        evaluation.policyUri,
        evaluation.details.description,
        evaluation.details.remediation,
        evaluation.labels
      )

      const ae = new AttestationEvaluation(a.attestation, evaluation)

      const existing = policyMap.get(data.uri)
      if (existing) {
        if (evaluation.status == PolicyResultStatus.UNSATISFIED) {
          existing.policy.description = evaluation.details.description
          existing.policy.remediation = evaluation.details.remediation
        }

        if (
          evaluation.status == PolicyResultStatus.SATISFIED &&
          !existing.policy.description
        ) {
          existing.policy.description = evaluation.details.description
        }

        existing.evaluations.push(ae)
      } else {
        policyMap.set(data.uri, {
          policy: data,
          evaluations: [ae]
        })
      }
    })
  })

  const resultsList: PolicyEvaluations[] = []
  policyMap.forEach((value) => {
    resultsList.push(new PolicyEvaluations(value.policy, value.evaluations))
  })

  const statusOrder = [
    PolicyResultStatus.UNSATISFIED,
    PolicyResultStatus.SATISFIED,
    PolicyResultStatus.NOT_APPLICABLE
  ]

  resultsList.sort((a, b) => {
    if (a.status == b.status) {
      return a.policy.uri.localeCompare(b.policy.uri)
    } else {
      return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status)
    }
  })
  return resultsList
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
