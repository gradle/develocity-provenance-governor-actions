import { jest } from '@jest/globals'

export const createClient =
  jest.fn<typeof import('../client.js').createClient>()
