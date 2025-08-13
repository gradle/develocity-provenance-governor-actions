import { BaseError } from './models.js'

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

export type PolicyErrorResponse = BaseError

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PolicySuccessResponse {}
