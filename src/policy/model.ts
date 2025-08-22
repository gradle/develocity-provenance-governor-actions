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
  storeRequest: PolicyStoreRequest
  storeResponse: PolicyStoreResponse
}

export interface PolicyStoreRequest {
  uri?: string
  [key: string]: unknown
}

export interface PolicyStoreResponse {
  [key: string]: unknown
}

export enum PolicyResultStatus {
  SATISFIED = 'SATISFIED',
  UNSATISFIED = 'UNSATISFIED',
  NOT_APPLICABLE = 'NOT_APPLICABLE'
}

export interface PolicyEvaluation {
  policyUri: string
  status: PolicyResultStatus
  details: PolicyEvaluationDetails
  labels: Record<string, string>
}

export interface PolicyEvaluationDetails {
  description?: string
  remediation?: string
  [key: string]: string | undefined
}
