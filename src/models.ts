export interface BaseErrorResponse<Request> {
  type?: string
  title?: string
  detail?: string
  instance?: string
  request?: Request
}

export interface Tenant {
  name: string
  description: string
  develocityInstances: string[]
  artifactoryInstances: string[]
}

export interface Package {
  type: string
  name: string
  namespace?: string
  version: string
}

export interface BaseCriteria {
  sha256: string
  repositoryUrl: string
}

export interface BaseRequest<Criteria extends BaseCriteria> {
  uri: string
  tenant: Tenant
  pkg: Package
  criteria: Criteria
}

export interface AttestationSubject {
  name?: string
  uri?: string
  downloadLocation?: string
  digest: {
    [algorithm: string]: string
  }
}

export interface AttestationStatement {
  predicateType: string
  subject: AttestationSubject[]
  _type: string
  predicate: object
}

export interface Envelope {
  payload: AttestationStatement
  payloadType: string
  signatures: object[] // Signature[]
}

export interface BaseSuccessResponse<
  Request extends BaseRequest<BaseCriteria>
> {
  request: Request
}

// export interface Signature {
//   // Add specific signature properties if needed
// }
