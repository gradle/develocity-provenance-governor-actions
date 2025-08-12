/* eslint-disable @typescript-eslint/no-require-imports */
const {
  fromPropertiesFile,
  inGradleUserHome
} = require('@gradle-tech/develocity-agent/api/config')
const { execSync } = require('node:child_process')

module.exports = {
  projectId: 'cavendish-github-actions',
  server: {
    url: 'https://develocity.grdev.net',
    accessKey: fromPropertiesFile(inGradleUserHome())
  },
  buildScan: {
    capture: {
      testLogging: true
    },
    obfuscation: {
      ipAddresses: (f) =>
        f.length > 1 ? f.substring(0, f.lastIndexOf('.')) + '.0' : f
    },
    ...buildScanUserData()
  }
}

function buildScanUserData() {
  const links = {}
  const tags = []
  const values = {}

  // some CI environments will expose the build url
  // as an environment variable
  const buildUrl = process.env.BUILD_URL
  // get last commit id
  const commitId = outputOf('git rev-parse HEAD')
  // get current branch name
  const branch = outputOf('git branch --show-current')
  // check if there are uncommitted changes
  const dirty = outputOf('git status --porcelain')

  if (buildUrl !== undefined) {
    links['TeamCity build'] = buildUrl
  }

  if (commitId !== undefined) {
    values['Git commit id'] = commitId
    // use your Develocity URL to add proper links
    links['Git Commit Build Scans'] =
      `https://develocity.grdev.net/scans?search.names=Git+commit+id&search.values=${commitId}`
  }

  // decide if it's a CI run or local run
  tags.push(process.env.CI !== undefined ? 'CI' : 'Local')
  if (branch !== undefined) {
    tags.push(branch)
  }
  if (dirty) {
    tags.push('Dirty')
  }

  return {
    links,
    tags,
    values
  }
}

function outputOf(command) {
  try {
    return execSync(command, { encoding: 'utf-8' }).toString().trim()
  } catch {
    // ignore errors, most likely the command is not available
    return undefined
  }
}
