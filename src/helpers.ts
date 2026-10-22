import * as core from '@actions/core'

/**
 * Annotation key prefix reserved by the Provenance Governor for values it
 * derives itself, such as the claims of the caller's OIDC token.
 */
const RESERVED_ANNOTATION_PREFIX = 'request.'

export function getOptionalInput(name: string): string | null {
  const value = core.getInput(name, { required: false })
  return value === '' ? null : value
}

/**
 * Parses multiline `key=value` annotation input.
 *
 * Each line splits on its first `=` so a value may contain further `=`
 * characters, as a URL with a query string does. Blank lines are skipped, and a
 * repeated key keeps the last value provided.
 *
 * @param lines The annotation lines, as returned by core.getMultilineInput
 * @returns The parsed annotations, empty when no lines were provided
 * @throws Error when a line has no `=`, has an empty key, or uses a key the
 *   Provenance Governor reserves for itself
 */
export function parseAnnotations(lines: string[]): Record<string, string> {
  const annotations = new Map<string, string>()

  for (const line of lines) {
    if (line.trim() === '') {
      continue
    }

    const separator = line.indexOf('=')
    if (separator === -1) {
      throw new Error(
        `Invalid annotation '${line}': expected a 'key=value' pair.`
      )
    }

    const key = line.slice(0, separator).trim()
    if (key === '') {
      throw new Error(`Invalid annotation '${line}': the key is empty.`)
    }
    if (key.toLowerCase().startsWith(RESERVED_ANNOTATION_PREFIX)) {
      throw new Error(
        `Invalid annotation key '${key}': the '${RESERVED_ANNOTATION_PREFIX}' prefix is reserved by the Provenance Governor.`
      )
    }

    if (annotations.has(key)) {
      core.warning(
        `Duplicate annotation key '${key}', the last value provided wins.`
      )
    }

    annotations.set(key, line.slice(separator + 1).trim())
  }

  return Object.fromEntries(annotations)
}
