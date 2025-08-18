import { jest } from '@jest/globals'

export const createPublisherReporter =
  jest.fn<typeof import('../publish/reporter.js').createPublisherReporter>()

export const createPolicyReporter =
  jest.fn<typeof import('../policy/reporter.js').createPolicyReporter>()
