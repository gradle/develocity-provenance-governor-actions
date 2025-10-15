import { BaseCriteria, BaseErrorResponse, BaseRequest } from '../models.js'

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

export type PolicySuccessResponse = PolicyEvaluation[]

export enum PolicyResultStatus {
  SATISFIED = 'satisfied',
  UNSATISFIED = 'unsatisfied',
  NOT_APPLICABLE = 'not-applicable'
}

export interface PolicyEvaluation {
  status: PolicyResultStatus
  labels?: Record<string, string>
  policyUri: string
  policyDescription?: string
  policyRemediation?: string
  attestationUri: string
  attestationStoreInstance: string
  attestationStoreUri: string
  sourcedFromUri?: string
  details?: Record<string, string>
}
