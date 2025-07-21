import * as core from '@actions/core'
import { createClient, Credentials } from './publisher-client.js'
import { PackageURL } from 'packageurl-js'
import { createReporter } from './reporter.js'

export async function run(): Promise<void> {
  try {
    const tenant = core.getInput('tenant', { required: true })
    const pkgType = core.getInput('subject-type', { required: true })
    const pkgNamespace = core.getInput('subject-namespace', { required: false })
    const pkgName = core.getInput('subject-name', { required: true })
    const pkgVersion = core.getInput('subject-version', { required: true })
    const buildScanIds = core.getMultilineInput('build-scan-ids', {
      required: true
    })
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

    const username = core.getInput('username')
    const password = core.getInput('password')

    const credentials: Credentials =
      username && password ? { username, password } : await core.getIDToken()

    // helpful logging
    core.startGroup(
      `Publishing attestation for subject: ${subjectPurl} - ${subjectDigest}`
    )
    core.info(`Subject Repository URL: ${repositoryUrl}`)
    core.info(
      `Publisher URL: ${attestationPublisherUrl} - in tenant: ${tenant}`
    )
    core.endGroup()

    // publish the attestations
    const publisherClient = createClient(attestationPublisherUrl, credentials)
    const result = await publisherClient.publishAttestation(
      tenant,
      pkgType,
      pkgNamespace,
      pkgName,
      pkgVersion,
      subjectDigest,
      repositoryUrl,
      buildScanIds
    )

    const reporter = createReporter()
    const subject = {
      name: subjectPurl.toString(),
      digest: { sha256: subjectDigest }
    }
    if (result.success) {
      reporter.reportSuccess(subject, result.successPayload) // TODO add first method arg
    } else {
      reporter.reportError(subject, result.errorPayload)
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
