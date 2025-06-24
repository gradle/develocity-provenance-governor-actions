import { jest } from '@jest/globals'

export const attest = jest.fn<typeof import('../src/attest.js').attest>()
