import {
  BaseCriteria,
  BaseErrorResponse,
  BaseRequest,
  BaseSuccessResponse
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

export interface PolicyRequestCriteria extends BaseCriteria {
  policyScanName: string
}

export type PolicyRequest = BaseRequest<PolicyRequestCriteria>

export type PolicyErrorResponse = BaseErrorResponse<PolicyRequest>

export class PolicySuccessResponse
  implements BaseSuccessResponse<PolicyRequest>
{
  request: PolicyRequest
  results: unknown[]

  constructor(data: { request: PolicyRequest; results: unknown[] }) {
    this.request = data.request
    this.results = data.results
  }
}
