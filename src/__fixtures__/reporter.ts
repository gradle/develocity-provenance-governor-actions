import { jest } from '@jest/globals'

export const createReporter =
  jest.fn<typeof import('../reporter.js').createReporter>()
