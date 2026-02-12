import { BaseReporter, Reporter, reportProblemDetails } from '../reporter.js'

import * as core from '@actions/core'
import {
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
    const hasFailures = hasUnsatisfiedEvaluation(result)
    const resultText = hasFailures
      ? statusIcon(PolicyResultStatus.UNSATISFIED) + ' UNSATISFIED'
      : statusIcon(PolicyResultStatus.SATISFIED) + ' SATISFIED'

    header(`Policy Scan Evaluated - ${resultText}`)

    reportSubjectInfo(subject)

    core.summary.addRaw('**Result:** ').addRaw(resultText).addEOL().addEOL()

    const policies = collectPolicyEvaluations(result)

    reportPolicyTable(policies)

    if (hasFailures) {
      if (setFailure) {
        core.setFailed(
          `Policy scan ${subject.scanName} evaluated to UNSATISFIED for ${subject.subjectName}`
        )
      }
      reportFailedPolicyDetails(policies)
    }
  }
}

function header(heading: string) {
  const headerImage =
    'https://raw.githubusercontent.com/gradle/develocity-provenance-governor-actions/cf78bf3e54d43cf9806a3ee3bbc7e2a4683ff786/src/policy/policy-header.svg'

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

function attestationName(attestation: PolicyEvaluationResult): string {
  if (attestation.attestationDownloadUri) {
    const uri = attestation.attestationDownloadUri
    return uri.substring(uri.lastIndexOf('/') + 1)
  } else {
    return 'N/A'
  }
}

function reportPolicyTable(policies: PolicyEvaluations[]) {
  const tableRows: SummaryTableRow[] = [
    [
      { data: 'Policy', header: true },
      { data: 'Type', header: true },
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
        data: `\n\n\`${evaluations.policy.name}\`\n`
      },
      {
        data: `\n\n\`${evaluations.policy.type}\`\n`
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
        .addRaw(policyEval.policy.name)
        .addRaw('`')
        .addEOL()
        .addEOL()

      core.summary
        .addRaw('**Type:** ')
        .addRaw('`')
        .addRaw(policyEval.policy.type)
        .addRaw('`')
        .addEOL()
        .addEOL()

      if (policyEval.policy.description) {
        core.summary
          .addRaw('**Description:** ')
          .addRaw(policyEval.policy.description)
          .addEOL()
          .addEOL()
      }

      if (policyEval.policy.remediation) {
        core.summary
          .addRaw('**Remediation:** ')
          .addRaw(policyEval.policy.remediation)
          .addEOL()
          .addEOL()
      }

      if (Object.keys(policyEval.policy.labels).length > 0) {
        core.summary.addRaw('**Labels:**').addEOL().addEOL()

        Object.entries(policyEval.policy.labels).forEach(([key, value]) => {
          core.summary.addRaw('- `' + key + '` = `' + value + '`').addEOL()
        })

        core.summary.addEOL().addEOL()
      }

      const tableRows: SummaryTableRow[] = [
        [
          { data: 'Attestation', header: true },
          { data: 'Status', header: true },
          { data: 'Details', header: true },
          { data: 'Build Scan', header: true }
        ]
      ]

      policyEval.failures.concat(policyEval.successes).forEach((evaluation) => {
        const otherDetailsJson = JSON.stringify(evaluation.details, null, 2)

        if (evaluation.status == PolicyResultStatus.UNSATISFIED) {
          core.error(
            'Policy ' +
              policyEval.policy.name +
              ' on attestation ' +
              attestationName(evaluation) +
              ' evaluated to UNSATISFIED'
          )
        }

        const buildScanUri = evaluation.sourceUri

        tableRows.push([
          {
            data: `\n\n\`${attestationName(evaluation)}\`\n`
          },
          { data: statusIcon(evaluation.status) },
          {
            data:
              otherDetailsJson != '{}'
                ? '\n\n<details>\n\n<summary>Details</summary>\n\n```json\n' +
                  otherDetailsJson +
                  '\n```\n\n</details>\n'
                : ''
          },
          {
            data: buildScanUri ? `\n\n[Build Scan](${buildScanUri})\n` : ''
          }
        ])
      })
      core.summary.addTable(tableRows).addEOL().addEOL()
    }
  })
}

class PolicyEvaluations {
  policy: PolicyData
  evaluations: PolicyEvaluationResult[]

  failures: PolicyEvaluationResult[]
  successes: PolicyEvaluationResult[]
  status: PolicyResultStatus

  totalApplicableAttestations: number

  constructor(policy: PolicyData, evaluations: PolicyEvaluationResult[]) {
    this.policy = policy
    this.evaluations = evaluations

    this.failures = evaluations.filter(
      (e) => e.status == PolicyResultStatus.UNSATISFIED
    )
    this.successes = evaluations.filter(
      (e) => e.status == PolicyResultStatus.SATISFIED
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
  name: string
  type: string
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

    const uriParts = uri.split('/')
    this.type = uriParts[uriParts.length - 2]
    this.name = uriParts[uriParts.length - 1]
  }
}

class PolicyEvaluationResult {
  status: PolicyResultStatus
  attestationDownloadUri: string
  sourceUri?: string
  details: Record<string, string>

  constructor(
    status: PolicyResultStatus,
    attestationUri: string,
    sourceUri: string | undefined,
    details: Record<string, string>
  ) {
    this.status = status
    this.attestationDownloadUri = attestationUri
    this.sourceUri = sourceUri
    this.details = details
  }
}

function collectPolicyEvaluations(
  results: PolicyEvaluation[]
): PolicyEvaluations[] {
  const policyMap = new Map<
    string,
    { policy: PolicyData; evaluations: PolicyEvaluationResult[] }
  >()

  results.forEach((r) => {
    const status = <PolicyResultStatus>r.status.toLowerCase()

    if (!Object.values(PolicyResultStatus).includes(status)) {
      core.error('Unknown status in response: ' + r.status)
      throw Error(`Unknown status in response: ${r.status}`)
    }
    r.status = status

    const data = new PolicyData(
      r.policyUri,
      r.policyDescription,
      r.policyRemediation,
      r.labels ?? {}
    )

    const result = new PolicyEvaluationResult(
      r.status,
      r.attestationUri,
      r.sourcedFromUri,
      r.details ?? {}
    )

    const existing = policyMap.get(data.uri)
    if (existing) {
      existing.evaluations.push(result)
    } else {
      policyMap.set(data.uri, {
        policy: data,
        evaluations: [result]
      })
    }
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

function hasUnsatisfiedEvaluation(evaluation: PolicyEvaluation[]) {
  return evaluation.some(
    (element) => element.status === PolicyResultStatus.UNSATISFIED
  )
}

function statusIcon(status: PolicyResultStatus): string {
  switch (status) {
    case PolicyResultStatus.SATISFIED:
      return '✅'
    case PolicyResultStatus.UNSATISFIED:
      return '❌'
    case PolicyResultStatus.NOT_APPLICABLE:
      return 'N/A'
    default:
      return '❓'
  }
}
