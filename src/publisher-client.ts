export interface PublisherResult {
  status: number
  success: boolean
  successPayload?: PublishSuccessResult
  errorPayload?: PublishErrorResult
}

/**
 * Interface defining the structure of a success response from the Attestation Publisher.
 */
export interface PublishSuccessResult {
  publishedAttestations?: Array<PublishedAttestation>
}

export interface PublishedAttestation {
  type: string
  downloadUrl: string
}
export interface FailedAttestation {
  type: string
  detail: string
}

/**
 * Interface defining the structure of an error response from the Attestation Publisher.
 */
export interface PublishErrorResult {
  type?: string
  title?: string
  detail?: string
  instance?: string
  publishedAttestations?: Array<PublishedAttestation>
  failedAttestations?: Array<FailedAttestation>
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
        success: true,
        successPayload: {
          publishedAttestations: [
            {
              type: 'https://cavendish.dev/java-toolchain/v1',
              downloadUrl:
                'https://todo.example.com/attestations/java-toolchain.json'
            }
          ]
        }
      })
    })
  }
}
