import {
  BaseCriteria,
  BaseErrorResponse,
  BaseRequest,
  BaseSuccessResponse
} from '../models.js'

/**
 * Interface defining the structure of an error response from the Attestation Publisher.
 */
export interface PublishErrorResponse extends BaseErrorResponse<PublishRequest> {
  successes?: Array<PublishSuccessItem>
  errors?: Array<PublishFailedItem>
}

export interface BuildScanCriteria {
  ids: string[]
  queries: string[]
}

export interface PublishRequestCriteria extends BaseCriteria {
  buildScan: BuildScanCriteria
}

export type PublishRequest = BaseRequest<PublishRequestCriteria>

export interface StoreResponse {
  repository: string
  path: string
  name: string
  uri: string
  sha256: string
  predicate_category: string
  predicate_type: string
  predicate_slug: string
  created_at: string
  created_by: string
  verified: boolean
}

export interface StoreErrorResponse {
  status: number
  message: string
  headers: Headers
  body: {
    errors: {
      message: string
    }[]
  }
}

export interface Attestation {
  payloadType: string
  payload: string
  signatures: object[] // Signature[]
}

export interface StoreRequest {
  uri: string
  body: Attestation
}

export interface PublishSuccessItem {
  storeType: string
  storeUri: string
  storeRequest: StoreRequest
  storeResponse: StoreResponse
}

export interface PublishFailedItem {
  storeType: string
  storeUri: string
  storeRequest: StoreRequest
  storeResponse: StoreErrorResponse
}

export interface ResourceDescriptor {
  name?: string
  uri?: string
  digest?: {
    [key: string]: string
  }
  content?: string
  downloadLocation?: string
  mediaType?: string
  annotations?: {
    [key: string]: string
  }
}
export interface Statement {
  _type: 'https://in-toto.io/Statement/v1'
  subject: ResourceDescriptor[]
  predicateType: string
  predicate: object
  createdAt: string
  createdBy: string
}

export class PublishRequestSubject {
  name: string
  digest: {
    sha256: string
  }

  constructor(name: string, digest: { sha256: string }) {
    this.name = name
    this.digest = digest
  }
}

export class PublishSuccessResponse implements BaseSuccessResponse<PublishRequest> {
  successes: PublishSuccessItem[]
  request: PublishRequest

  constructor(data: {
    request: PublishRequest
    successes: PublishSuccessItem[]
  }) {
    this.request = data.request
    this.successes = data.successes
  }

  // Example method to get all store types
  getStoreTypes(): string[] {
    return this.successes.map((success) => success.storeType)
  }

  // Example method to get success count
  getSuccessCount(): number {
    return this.successes.length
  }

  // Example method to get all resource URIs
  getResourceUris(): string[] {
    return this.successes.map((success) => success.storeRequest.uri)
  }

  // Example method to check if any success is verified
  hasVerifiedSuccesses(): boolean {
    return this.successes.some((success) => success.storeResponse.verified)
  }
}

export function fromJSON(json: string): PublishSuccessResponse {
  return new PublishSuccessResponse(JSON.parse(json))
}
