import * as core from '@actions/core'
import {createClient, Credentials} from './client.js'
import {createPolicyReporter} from './reporter-policy.js'
import {PackageURL} from 'packageurl-js'

export async function run(): Promise<void> {
  try {
    // Collect inputs
    const policyEvaluatorUrl = core.getInput('policy-evaluator-url', {
      required: true
    })
    const policyScanName = core.getInput('policy-scan', { required: true })

    const tenant = core.getInput('tenant', { required: true })
    const pkgType = core.getInput('subject-type', { required: true })
    const pkgNamespace = core.getInput('subject-namespace', { required: false })
    const pkgName = core.getInput('subject-name', { required: true })
    const pkgVersion = core.getInput('subject-version', { required: true })

    const subjectDigest = core.getInput('subject-digest', { required: true })
    const repositoryUrl = core.getInput('subject-repository-url', {
      required: true
    })

    const subjectPurl = new PackageURL(
      pkgType,
      pkgNamespace,
      pkgName,
      pkgVersion
    )

    const username = core.getInput('username')
    const password = core.getInput('password')

    const credentials: Credentials =
      username && password ? { username, password } : await core.getIDToken()

    // helpful logging
    core.startGroup(
      `Evaluating policy for subject: ${subjectDigest} from: ${repositoryUrl}`
    )
    core.info(
      `Policy Evaluation URL: ${policyEvaluatorUrl} - for policy: ${policyScanName}`
    )
    core.endGroup()

    const client = createClient(policyEvaluatorUrl, credentials)
    const result = await client.evaluatePolicy(
      tenant,
      policyScanName,
      subjectPurl,
      subjectDigest,
      repositoryUrl
    )

    // if error set failure status
    result.onError((error) => {
      core.setFailed(
        `Policy evaluation for subject: ${subjectDigest} failed: ${error?.title}`
      )
      core.error(JSON.stringify(error, null, 2))
    })

    // create summary
    const reporter = createPolicyReporter()
    const subject = {
      digest: { sha256: subjectDigest }
    }
    reporter.report(result.status, subject, result)
  } catch (error) {
    if (error instanceof Error)
      core.setFailed(`Action failed with error: ${error.message}`)
    else core.setFailed(`Action failed with error: ${error}`)
  }
  await core.summary.write()
}
