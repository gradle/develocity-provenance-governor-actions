import * as core from '@actions/core'
import { createClient, Credentials } from '../client.js'
import { createPolicyReporter } from './reporter.js'
import { PackageURL } from 'packageurl-js'
import {
  PolicyLabelMatcher,
  PolicyLabelMatcherSet,
  PolicyRequestSubject
} from './model.js'

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

    const ignoreLabelsString =
      core.getMultilineInput('ignore-policies-with-labels') ?? []

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

    // create summary
    const reporter = createPolicyReporter()
    const subject = new PolicyRequestSubject(
      policyScanName,
      subjectPurl.toString(),
      { sha256: subjectDigest },
      parseIgnoreLabels(ignoreLabelsString)
    )
    reporter.report(result.status, subject, result.result)
  } catch (error) {
    if (error instanceof Error)
      core.setFailed(`Action failed with error: ${error.message}`)
    else core.setFailed(`Action failed with error: ${error}`)
  }
  await core.summary.write()
}

// exported for testing
export function parseIgnoreLabels(
  ignoreLabelsString: string[]
): PolicyLabelMatcherSet[] {
  const sets: PolicyLabelMatcherSet[] = []
  let matchers: PolicyLabelMatcher[] = []

  ignoreLabelsString.forEach((line) => {
    if (line.trim().length == 0) {
      if (matchers.length > 0) {
        sets.push(new PolicyLabelMatcherSet(matchers))
      }
      matchers = []
    } else {
      line.split(',').forEach((label) => {
        const parts = label
          .trim()
          .split('=')
          .map((part) => part.trim())
          .filter((part) => part.length > 0)

        if (parts.length != 2) {
          throw new Error(
            "Invalid label matcher format. Expected '{key}={value}'."
          )
        }
        matchers.push(new PolicyLabelMatcher(parts[0].trim(), parts[1].trim()))
      })
    }
  })

  if (matchers.length > 0) {
    sets.push(new PolicyLabelMatcherSet(matchers))
  }
  return sets
}
