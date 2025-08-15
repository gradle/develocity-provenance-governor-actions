import {
  BaseCriteria,
  BaseErrorResponse,
  BaseRequest,
  BaseSuccessResponse,
  Envelope
} from '../models.js'

export class PolicyRequestSubject {
  scanName: string
  subjectName: string
  digest: {
    sha256: string
  }

  constructor(
    scanName: string,
    subjectName: string,
    digest: { sha256: string }
  ) {
    this.scanName = scanName
    this.subjectName = subjectName
    this.digest = digest
  }
}

export interface PolicyRequest extends BaseRequest<BaseCriteria> {
  policyScanName: string
}

export type PolicyErrorResponse = BaseErrorResponse<PolicyRequest>

export class PolicySuccessResponse
  implements BaseSuccessResponse<PolicyRequest>
{
  request: PolicyRequest
  results: PolicyAttestationEvaluation[]

  constructor(data: {
    request: PolicyRequest
    results: PolicyAttestationEvaluation[]
  }) {
    this.request = data.request
    this.results = data.results
  }
}

export interface PolicyAttestationEvaluation {
  attestation: PolicyAttestation
  evaluations: PolicyEvaluation[]
}

export function hasUnsatisfiedEvaluation(
  evaluation: PolicyAttestationEvaluation[]
) {
  return evaluation.some((element) =>
    element.evaluations.some((e) => e.status === PolicyResultStatus.UNSATISFIED)
  )
}

export interface PolicyAttestation {
  envelope: Envelope
  storeType: string
  storeUri: string
  storeRequest: object
  storeResponse: object
}

export enum PolicyResultStatus {
  SATISFIED = 'SATISFIED',
  UNSATISFIED = 'UNSATISFIED',
  UNSUPPORTED_PREDICATE_TYPE = 'UNSUPPORTED_PREDICATE_TYPE'
}

export interface PolicyEvaluation {
  policyUri: string
  status: PolicyResultStatus
  details: PolicyEvaluationDetails
  labels: PolicyLabels
}

export interface PolicyEvaluationDetails {
  description?: string
  remediation?: string
  [key: string]: string | undefined
}

export interface PolicyLabels {
  [key: string]: string | undefined
}
