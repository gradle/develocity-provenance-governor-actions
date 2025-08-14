export interface BaseErrorResponse<Request> {
  type?: string
  title?: string
  detail?: string
  instance?: string
  request?: Request
}
export interface DevelocityInstance {
  uri: string
}

export interface ArtifactoryInstance {
  uri: string
  path: string
  graphqlPath: string
}

export interface Tenant {
  name: string
  description: string
  develocityInstances: {
    [key: string]: DevelocityInstance
  }
  artifactoryInstances: {
    [key: string]: ArtifactoryInstance
  }
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

export interface BaseSuccessResponse<
  Request extends BaseRequest<BaseCriteria>
> {
  request: Request
}

// export interface Signature {
//   // Add specific signature properties if needed
// }
