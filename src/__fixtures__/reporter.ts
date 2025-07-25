import { jest } from '@jest/globals'

export const createPublisherReporter =
  jest.fn<typeof import('../reporter-publisher.js').createPublisherReporter>()

export const createPolicyReporter =
  jest.fn<typeof import('../reporter-policy.js').createPolicyReporter>()
