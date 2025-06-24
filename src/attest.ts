/**
 * Creates attestations.
 *
 * @param subject The purl of the subject.
 * @returns Resolves with 'done!' after the wait is over.
 */
export async function attest(subject: string): Promise<string> {
  return new Promise((resolve) => {
    console.log('Creating attestation for subject: ', subject)
    resolve('done!')
  })
}
