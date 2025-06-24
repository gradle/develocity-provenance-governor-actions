import * as core from '@actions/core'
import { attest } from './attest.js'

export async function run(): Promise<void> {
  try {
    // Get the audience input
    // const audience = core.getInput('audience')
    const subjectPurl = core.getInput('subject')

    // Retrieve the ID token
    // const idToken = await core.getIDToken(audience)

    // Log the ID token
    // core.info(`ID Token: ${idToken}`)
    core.info(`Attesting for subject: ${subjectPurl}`)
    await attest(subjectPurl)
    core.info(`Attestation for subject: ${subjectPurl} completed successfully!`)

    core.setOutput(
      'status-md',
      `✅ Attestation for subject: ${subjectPurl} completed successfully!`
    )
  } catch (error) {
    if (error instanceof Error)
      core.setFailed(`Action failed with error: ${error.message}`)
    else core.setFailed(`Action failed with error: ${error}`)
  }
}
