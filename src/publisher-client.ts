import { ErrorResponse, SuccessResponse } from './publish-models.js'

export interface PublisherResult {
  status: number
  success: boolean
  successPayload?: SuccessResponse
  errorPayload?: ErrorResponse
}

export function createClient(
  baseUrl: string,
  credentials: Credentials
): AttestationPublisher {
  return new ApiAttestationPublisher(baseUrl, credentials)
}

/**
 * Interface defining the structure of an attestation publisher
 */
export interface AttestationPublisher {
  publishAttestation(
    tenant: string,
    pkgType: string,
    pkgNamespace: string | null,
    pkgName: string,
    pkgVersion: string,
    digest: string,
    repositoryUrl: string,
    buildScanIds: string[]
  ): Promise<PublisherResult>
}

export type Credentials = string | { username: string; password: string }

/**
 * Class implementing the attestation publisher functionality
 */
class ApiAttestationPublisher implements AttestationPublisher {
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
   * @param pkgType Type of subject as defined by PURL spec (oci, maven, npm, etc)
   * @param pkgNamespace Package namespace as defined by PURL spec (e.g. a Maven groupId)
   * @param pkgName Package name as defined by PURL spec (e.g. a Maven artifactId)
   * @param pkgVersion Version of the package as defined by PURL spec (this could also be a sha256 digest for an OCI image)
   * @param digest The digest of the image, usually containing the digest type prefix (e.g. sha256:<digest-string-here>)
   * @param repositoryUrl The repository the subject artifact was published to.
   * @param buildScanIds The build scan ID that created the subject artifact.
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
    buildScanIds: string[]
  ): Promise<PublisherResult> {
    const publisherUrl = pkgNamespace
      ? `${this.baseUrl}${tenant}/packages/${pkgType}/${pkgNamespace}/${pkgName}/${pkgVersion}/`
      : `${this.baseUrl}${tenant}/packages/${pkgType}/${pkgName}/${pkgVersion}/`

    const authHeader =
      typeof this.credentials === 'string'
        ? `Bearer ${this.credentials}`
        : `Basic ${Buffer.from(this.credentials.username + ':' + this.credentials.password).toString('base64')}`

    console.log('Calling publisher: ', publisherUrl)

    try {
      const response = fetch(publisherUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader
        },
        body: JSON.stringify({
          repositoryUrl: repositoryUrl,
          digest: digest,
          buildScan: {
            ids: buildScanIds
          }
        })
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
      return Promise.resolve({
        status: 0,
        success: false,
        errorPayload: {
          detail:
            error instanceof Error ? error.message : 'Unknown error occurred'
        }
      })
    }
  }
}
