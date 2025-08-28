import * as core from '@actions/core'

export function getOptionalInput(name: string): string | null {
  const value = core.getInput(name, { required: false })
  return value === '' ? null : value
}
