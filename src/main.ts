import * as core from '@actions/core'
import { createClient } from './publisher-client.js'
import { PackageURL } from 'packageurl-js'
import { createReporter } from './reporter.js'

export async function run(): Promise<void> {
  try {
    const tenant = core.getInput('tenant', { required: true })
    const pkgType = core.getInput('subject-type', { required: true })
    const pkgNamespace = core.getInput('subject-namespace', { required: false })
    const pkgName = core.getInput('subject-name', { required: true })
    const pkgVersion = core.getInput('subject-version', { required: true })
    const subjectPurl = new PackageURL(
      pkgType,
      pkgNamespace,
      pkgName,
      pkgVersion
    )

    // collect inputs
    const subjectDigest = core.getInput('subject-digest', { required: true })
    const repositoryUrl = core.getInput('subject-repository-url', {
      required: true
    })
    const attestationPublisherUrl = core.getInput('attestation-publisher-url', {
      required: true
    })

    // two modes of authentication, API token or GH Actions ID token
    const attestationPublisherApiToken = core.getInput(
      'attestation-publisher-api-token'
    )
    const idToken = await core.getIDToken()
    const authenticationType = attestationPublisherApiToken
      ? 'token'
      : 'api-token'

    // helpful logging
    core.startGroup(
      `Publishing attestation for subject: ${subjectPurl} - ${subjectDigest}`
    )
    core.info(`Subject Repository URL: ${repositoryUrl}`)
    core.info(
      `Publisher URL: ${attestationPublisherUrl} - in tenant: ${tenant}`
    )
    core.info(`Using authentication type: ${authenticationType}`)
    // TODO: remove this
    core.debug(`Using idToken: ${idToken}`)
    core.endGroup()

    // publish the attestations
    const publisherClient = createClient(attestationPublisherUrl, idToken)
    const result = await publisherClient.publishAttestation(
      tenant,
      pkgType,
      pkgNamespace,
      pkgName,
      pkgVersion,
      subjectDigest,
      repositoryUrl
    )

    const reporter = createReporter()

    if (result.success) {
      reporter.reportSuccess(subjectPurl, subjectDigest, result.successPayload)
    } else {
      reporter.reportError(subjectPurl, subjectDigest, result.errorPayload)
      core.setFailed(
        `Attestation publisher for subject: ${subjectPurl} failed: ${result.errorPayload?.title}`
      )
      core.error(JSON.stringify(result.errorPayload, null, 2))
    }
  } catch (error) {
    if (error instanceof Error)
      core.setFailed(`Action failed with error: ${error.message}`)
    else core.setFailed(`Action failed with error: ${error}`)
  }
}
