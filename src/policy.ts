import * as core from '@actions/core'
import { createClient, Credentials } from './client.js'
import { createPolicyReporter } from './reporter-policy.js'

export async function run(): Promise<void> {
  try {
    // Collect inputs
    const policyEvaluatorUrl = core.getInput('policy-evaluator-url', {
      required: true
    })
    const policyName = core.getInput('policy', { required: true })
    const subjectDigest = core.getInput('subject-digest', { required: true })
    const repositoryUrl = core.getInput('subject-repository-url', {
      required: true
    })

    const username = core.getInput('username')
    const password = core.getInput('password')

    const credentials: Credentials =
      username && password ? { username, password } : await core.getIDToken()

    // helpful logging
    core.startGroup(
      `Evaluating policy for subject: ${subjectDigest} from: ${repositoryUrl}`
    )
    core.info(
      `Policy Evaluation URL: ${policyEvaluatorUrl} - for policy: ${policyName}`
    )
    core.endGroup()

    const client = createClient(policyEvaluatorUrl, credentials)
    const result = await client.evaluatePolicy(
      policyName,
      subjectDigest,
      repositoryUrl
    )

    // if error set failure status
    result.onError((error) => {
      core.setFailed(
        `Attestation publisher for subject: ${subjectDigest} failed: ${error?.title}`
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
  core.summary.write()
}
