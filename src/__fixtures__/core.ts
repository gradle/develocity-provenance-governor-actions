import type * as core from '@actions/core'
import { summary as coreSummary } from '@actions/core'
import { jest } from '@jest/globals'

export const debug = jest.fn<typeof core.debug>()
export const error = jest.fn<typeof core.error>()
export const info = jest.fn<typeof core.info>()
export const getInput = jest.fn<typeof core.getInput>()
export const getIDToken = jest.fn<typeof core.getIDToken>()
export const setOutput = jest.fn<typeof core.setOutput>()
export const setFailed = jest.fn<typeof core.setFailed>()
export const warning = jest.fn<typeof core.warning>()
export const startGroup = jest.fn<typeof core.startGroup>()
export const endGroup = jest.fn<typeof core.endGroup>()
export const exportVariable = jest.fn<typeof core.exportVariable>()
export const addPath = jest.fn<typeof core.addPath>()
export const setSecret = jest.fn<typeof core.setSecret>()
export const getBooleanInput = jest.fn<typeof core.getBooleanInput>()
export const getMultilineInput = jest.fn<typeof core.getMultilineInput>()

// Mock Summary class with chainable methods
// const summaryInstance = {
//     addBreak: jest.fn<typeof core.summary.addBreak>(),
//     addRaw: jest.fn<typeof core.summary.addRaw>(),
//     addEOL: jest.fn<typeof core.summary.addEOL>(),
//     addLink: jest.fn<typeof core.summary.addLink>(),
//     addTable: jest.fn<typeof core.summary.addTable>(),
// }

export const summary = coreSummary
