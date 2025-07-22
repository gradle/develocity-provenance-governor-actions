import { PackageURL } from 'packageurl-js'
import { SummaryReporter } from '../src/reporter.js'
import * as fs from 'fs'
import * as core from '@actions/core'
import { Marked } from 'marked'

// Enable GitHub Flavored Markdown
const marked = new Marked({
  gfm: true,
  breaks: true,
  pedantic: false,
  silent: false,
  headerIds: true
})

function parseArgs() {
  const args = process.argv.slice(2)
  const result = {
    status: null,
    jsonFilePath: null,
    outputFile: null,
    outputFormat: 'md' // default format
  }

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--output') {
      i++
      if (i >= args.length) {
        throw new Error('Missing value for --output flag')
      }
      const format = args[i].toLowerCase()
      if (format !== 'md' && format !== 'html') {
        throw new Error('Output format must be either "md" or "html"')
      }
      result.outputFormat = format
    } else if (!result.status) {
      result.status = parseInt(args[i], 10)
    } else if (!result.jsonFilePath) {
      result.jsonFilePath = args[i]
    } else if (!result.outputFile) {
      result.outputFile = args[i]
    }
  }

  if (!result.status || !result.jsonFilePath) {
    throw new Error(
      'Usage: npm run render <status> <json-file-path> [output-file] [--output md|html]'
    )
  }

  return result
}

const args = parseArgs()

// Read the JSON file
const json = JSON.parse(fs.readFileSync(args.jsonFilePath, 'utf8'))

const digest =
  'sha256:1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'

// Create a PackageURL from the JSON file
const subjectPurl = new PackageURL('oci', '', 'name', digest)

// Create a reporter
const reporter = new SummaryReporter()

const resource = { name: 'test-render', digest: { sha256: 'test-digest' } }
if (args.status === 200) {
  reporter.reportSuccess(resource, json)
} else {
  reporter.reportError(resource, json)
}

const markdown = core.summary.stringify()

let output
if (args.outputFormat === 'md') {
  output = markdown
} else {
  const html = marked.parse(markdown)

  // Create a complete HTML document
  output = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Report Summary</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/4.0.0/github-markdown.min.css"
</head>
<body>
    ${html}
</body>
</html>
`
}

if (!args.outputFile) {
  console.log()
  console.log()
  console.log(output)
} else {
  fs.writeFileSync(outputFile, output)
  console.log()
  console.log(`Output written to: ${outputFile}`)
}

// cleanup the summary object
core.summary.emptyBuffer()
