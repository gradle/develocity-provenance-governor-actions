import {
  BaseError,
  PolicyErrorResponse,
  PolicySuccessResponse,
  PublishErrorResponse,
  PublishSuccessResponse
} from './models.js'
import { PackageURL } from 'packageurl-js'

export abstract class ClientResult<Type> {
  status: number
  success: boolean
  result?: Type

  constructor(status: number, success: boolean, result: Type) {
    this.status = status
    this.success = success
    this.result = result
  }

  onError(handler: (error: BaseError) => void): void {
    if (!this.success) {
      handler(this.result as BaseError)
    }
  }
}

export class PublisherResult extends ClientResult<
  PublishSuccessResponse | PublishErrorResponse
> {
  constructor(
    status: number,
    success: boolean,
    result: PublishSuccessResponse | PublishErrorResponse
  ) {
    super(status, success, result)
  }
}

export class PolicyResult extends ClientResult<
  PolicySuccessResponse | PolicyErrorResponse
> {
  constructor(
    status: number,
    success: boolean,
    result: PolicySuccessResponse | PolicyErrorResponse
  ) {
    super(status, success, result)
  }
}

export function createClient(
  baseUrl: string,
  credentials: Credentials
): Client {
  return new ApiClient(baseUrl, credentials)
}

/**
 * Interface defining the structure of an attestation publisher
 */
export interface Client {
  publishAttestation(
    tenant: string,
    pkgType: string,
    pkgNamespace: string | null,
    pkgName: string,
    pkgVersion: string,
    digest: string,
    repositoryUrl: string,
    buildScanIds: string[],
    buildScanQueries: string[]
  ): Promise<PublisherResult>

  evaluatePolicy(
    tenant: string,
    policyScan: string,
    purl: PackageURL,
    digest: string,
    repositoryUrl: string
  ): Promise<PolicyResult>
}

export type Credentials = string | { username: string; password: string }

/**
 * Class implementing the attestation publisher and evaluation functionality
 */
class ApiClient implements Client {
  private readonly baseUrl: string
  private readonly credentials: Credentials

  constructor(baseUrl: string, credentials: Credentials) {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/'
    this.credentials = credentials
  }

  /**
   * Publishes an attestation for the given subject.
   *
   * @param tenant Name of the tenant
   * @param pkgType Type of subject as defined by PURL spec (oci, maven, npm, etc.)
   * @param pkgNamespace Package namespace as defined by PURL spec (e.g. a Maven groupId)
   * @param pkgName Package name as defined by PURL spec (e.g. a Maven artifactId)
   * @param pkgVersion Version of the package as defined by PURL spec (this could also be a sha256 digest for an OCI image)
   * @param digest The digest of the image, usually containing the digest type prefix (e.g. sha256:<digest-string-here>)
   * @param repositoryUrl The repository the subject artifact was published to.
   * @param buildScanIds The build scan IDs to create attestations from.
   * @param buildScanQueries The build scan queries to create attestations from.
   * @returns Promise that resolves when the attestation is published
   */
  async publishAttestation(
    tenant: string,
    pkgType: string,
    pkgNamespace: string,
    pkgName: string,
    pkgVersion: string,
    digest: string,
    repositoryUrl: string,
    buildScanIds: string[],
    buildScanQueries: string[]
  ): Promise<ClientResult<PublishSuccessResponse | PublishErrorResponse>> {
    const publisherUrl = pkgNamespace
      ? `${this.baseUrl}${tenant}/packages/${pkgType}/${pkgNamespace}/${pkgName}/${pkgVersion}/attestations`
      : `${this.baseUrl}${tenant}/packages/${pkgType}/${pkgName}/${pkgVersion}/attestations`

    const payload = JSON.stringify({
      repositoryUrl: repositoryUrl,
      sha256: digest,
      buildScan: {
        ids: buildScanIds,
        queries: buildScanQueries
      }
    })

    console.log('Calling publisher: ', publisherUrl)
    console.debug('Calling publisher with payload: ', payload)

    try {
      const response = fetch(publisherUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: this.authHeaderValue()
        },
        body: payload
      })

      return response.then(async (response) => {
        const data = await response.json()
        return {
          status: response.status,
          success: response.ok,
          successPayload: response.ok ? data : null,
          errorPayload: !response.ok ? data : null
        }
      }) as Promise<PublisherResult>
    } catch (error) {
      return Promise.resolve(
        new PublisherResult(0, false, {
          detail:
            error instanceof Error ? error.message : 'Unknown error occurred'
        })
      )
    }
  }

  /**
   * Evaluates the policy for the given subject.
   *
   * @param tenant Name of the tenant
   * @param policyScan Name of the policy scan to evaluate
   * @param purl The pURL of the subject
   * @param digest The digest of the image, usually containing the digest type prefix (e.g. sha256:<digest-string-here>)
   * @param repositoryUrl The repository the subject artifact was published to.
   */
  evaluatePolicy(
    tenant: string,
    policyScan: string,
    purl: PackageURL,
    digest: string,
    repositoryUrl: string
  ): Promise<PolicyResult> {
    const namespacePath = purl.namespace ? `/${purl.namespace}` : ''
    const evalUrl = `/${tenant}/packages/${purl.type}${namespacePath}/${purl.name}/${purl.version}/policy-scans/${policyScan}`

    const payload = JSON.stringify({
      repositoryUrl: repositoryUrl,
      sha256: digest
    })

    console.log('Calling policy evaluator: ', evalUrl)
    console.debug('Calling evaluator with payload: ', payload)

    // TODO: reduce duplicate code, I'm not sure what the evaluator code looks like, so it's duplicated for now
    try {
      const response = fetch(evalUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: this.authHeaderValue()
        },
        body: payload
      })

      return response.then(async (response) => {
        const data = await response.json()
        return {
          status: response.status,
          success: response.ok,
          successPayload: response.ok ? data : null,
          errorPayload: !response.ok ? data : null
        }
      }) as Promise<PolicyResult>
    } catch (error) {
      return Promise.resolve(
        new PolicyResult(0, false, {
          detail:
            error instanceof Error ? error.message : 'Unknown error occurred'
        })
      )
    }
  }

  authHeaderValue(): string {
    return typeof this.credentials === 'string'
      ? `Bearer ${this.credentials}`
      : `Basic ${Buffer.from(this.credentials.username + ':' + this.credentials.password).toString('base64')}`
  }
}
