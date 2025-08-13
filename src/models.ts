export interface BaseError {
  type?: string
  title?: string
  detail?: string
  instance?: string
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

// export interface Signature {
//   // Add specific signature properties if needed
// }
