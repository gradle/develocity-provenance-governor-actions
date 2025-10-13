import {
  BaseCriteria,
  BaseErrorResponse,
  BaseRequest,
  BaseSuccessResponse
} from '../models.js'

export class PolicyRequestSubject {
  scanName: string
  enforcementPointName?: string
  subjectName: string
  digest: {
    sha256: string
  }

  constructor(
    scanName: string,
    enforcementPointName: string | null,
    subjectName: string,
    digest: { sha256: string }
  ) {
    this.enforcementPointName = enforcementPointName ?? undefined
    this.scanName = scanName
    this.subjectName = subjectName
    this.digest = digest
  }
}

export interface PolicyRequest extends BaseRequest<BaseCriteria> {
  policyScanName: string
  enforcementPointName?: string
}

export type PolicyErrorResponse = BaseErrorResponse<PolicyRequest>

export class PolicySuccessResponse
  implements BaseSuccessResponse<PolicyRequest>
{
  request: PolicyRequest
  results: PolicyEvaluation[]

  constructor(data: { request: PolicyRequest; results: PolicyEvaluation[] }) {
    this.request = data.request
    this.results = data.results
  }
}

export enum PolicyResultStatus {
  SATISFIED = 'satisfied',
  UNSATISFIED = 'unsatisfied',
  NOT_APPLICABLE = 'not-applicable'
}

export interface PolicyEvaluation {
  policyUri: string
  policyType: string
  policyDescription?: string
  policyRemediation?: string
  attestationStoreInstance: string
  attestationStoreUri: string
  sourcedFromInstance?: string
  sourcedFromUri?: string
  status: PolicyResultStatus
  details: Record<string, string>
  labels: Record<string, string>
}
