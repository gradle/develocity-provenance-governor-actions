module.exports = {
  projectId: 'attest-action',
  server: {
    url: 'https://develocity.sdlc-demo.gradle.com'
  },
  buildScan: {
    capture: {
      testLogging: true
    },
    obfuscation: {
      ipAddresses: (f) =>
        f.length > 1 ? f.substring(0, f.lastIndexOf('.')) + '.0' : f
    }
  }
}
