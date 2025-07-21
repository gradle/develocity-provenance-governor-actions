import { ErrorResponse, SuccessResponse } from './publish-models.js'

export interface PublisherResult {
  status: number
  success: boolean
  successPayload?: SuccessResponse
  errorPayload?: ErrorResponse
}

export function createClient(
  baseUrl: string,
  apiToken: string
): AttestationPublisher {
  return new ApiAttestationPublisher(baseUrl, apiToken)
}

/**
 * Interface defining the structure of an attestation publisher
 */
export interface AttestationPublisher {
  publishAttestation(
    tenant: string,
    pkgType: string,
    pkgNamespace: string,
    pkgName: string,
    pkgVersion: string,
    digest: string,
    repositoryUrl: string
  ): Promise<PublisherResult>
}

/**
 * Class implementing the attestation publisher functionality
 */
class ApiAttestationPublisher implements AttestationPublisher {
  private readonly baseUrl: string
  private readonly apiToken: string

  constructor(baseUrl: string, apiToken: string) {
    this.baseUrl = baseUrl
    this.apiToken = apiToken
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
   * @returns Promise that resolves when the attestation is published
   */
  async publishAttestation(
    tenant: string,
    pkgType: string,
    pkgNamespace: string,
    pkgName: string,
    pkgVersion: string,
    digest: string,
    repositoryUrl: string
  ): Promise<PublisherResult> {
    return new Promise((resolve) => {
      const publisherUrl =
        this.baseUrl +
        `/${tenant}/packages/${pkgType}/${pkgNamespace}/${pkgName}/${pkgVersion}/`
      console.log(
        'Calling publisher: ',
        publisherUrl,
        repositoryUrl,
        digest,
        this.apiToken
      ) // fixme: remove token this

      resolve({
        status: 200,
        success: true
      })
    })
  }
}
