import * as core from '@actions/core'
import { createClient, Credentials } from '../client.js'
import { PackageURL } from 'packageurl-js'
import { createPublisherReporter } from './reporter.js'
import { PublishRequestSubject } from './model.js'

export async function run(): Promise<void> {
  try {
    const tenant = core.getInput('tenant', { required: true })
    const pkgType = core.getInput('subject-type', { required: true })
    const pkgNamespace = core.getInput('subject-namespace', { required: false })
    const pkgName = core.getInput('subject-name', { required: true })
    const pkgVersion = core.getInput('subject-version', { required: true })
    const buildScanIds = core.getMultilineInput('build-scan-ids', {
      required: false
    })
    const buildScanQueries = core.getMultilineInput('build-scan-queries', {
      required: false
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

    if (!buildScanIds && !buildScanQueries) {
      core.error(
        'No build scan IDs or queries provided. At least one is required.'
      )
      core.setFailed('Action failed due to missing build scan information.')
      return
    }

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
      buildScanIds ?? [],
      buildScanQueries ?? []
    )

    // if error set failure status
    result.onError((error) => {
      core.setFailed(
        `Attestation publisher for subject: ${subjectPurl} failed: ${error?.title}`
      )
      core.error(JSON.stringify(error, null, 2))
    })

    // create summary
    const reporter = createPublisherReporter()
    const subject = new PublishRequestSubject(subjectPurl.toString(), {
      sha256: subjectDigest
    })
    reporter.report(result.status, subject, result.result)
  } catch (error) {
    if (error instanceof Error)
      core.setFailed(`Action failed with error: ${error.message}`)
    else core.setFailed(`Action failed with error: ${error}`)
  }
  await core.summary.write()
}
