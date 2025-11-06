import * as core from '@actions/core'
import { SummaryTableRow } from '@actions/core/lib/summary.js'
import { BaseReporter, Reporter, reportProblemDetails } from '../reporter.js'
import {
  PublishErrorResponse,
  PublishFailedItem,
  PublishRequestSubject,
  PublishSuccessItem,
  PublishSuccessResponse,
  Statement,
  StoreRequest
} from './model.js'

export function createPublisherReporter(): Reporter<
  PublishRequestSubject,
  PublishSuccessResponse,
  PublishErrorResponse
> {
  return new PublisherSummaryReporter()
}

export class PublisherSummaryReporter extends BaseReporter<
  PublishRequestSubject,
  PublishSuccessResponse,
  PublishErrorResponse
> {
  reportSuccess(
    subject: PublishRequestSubject,
    result: PublishSuccessResponse
  ) {
    core.info(
      `Attestation publishing for subject: ${subject.name} completed successfully!`
    )

    header('Attestations Published')
    subjectInfo(subject, result)

    const items = groupSuccessByResource(result.successes)
    const rows: SummaryTableRow[] = [headerRow()]

    items.forEach((success) => {
      const row = successItemToRow(success)
      rows.push(row)
    })

    core.summary.addTable(rows)
  }

  reportError(
    subject: PublishRequestSubject,
    result: PublishErrorResponse,
    setFailure: boolean
  ) {
    header('Attestations Publishing Failed')

    if (setFailure) {
      core.setFailed(
        `Attestation publishing for subject ${subject.name} errored`
      )
      core.error('Error response: ' + JSON.stringify(result, null, 2))
    }

    reportProblemDetails(result)

    // print table if we have errors or successes
    if (result?.errors || result?.successes) {
      subjectInfo(subject, result)

      // header
      const rows: SummaryTableRow[] = [errorHeaderRow()]

      if (result?.errors) {
        result.errors.forEach((error: PublishFailedItem) => {
          const row = errorRow(error)
          rows.push(row)
        })
      }

      rows.push(...successRows(result))
      core.summary.addTable(rows)
      core.summary.addEOL()
    }
  }
}

function subjectInfo(
  subject: PublishRequestSubject,
  result?: PublishSuccessResponse | PublishErrorResponse
) {
  let uiArtifactUri
  if (result && result.request) {
    const repoUrlParts = result.request.criteria.repositoryUrl.split('/')
    const tag = result.request.pkg.version

    let storeUri

    // get the artifact uri from the result items
    if (result && result.successes && result.successes[0]) {
      storeUri = result.successes[0].storeUri.replace(/\/+$/, '')
    } else if ('errors' in result && result.errors && result.errors[0]) {
      storeUri = result.errors[0].storeUri.replace(/\/+$/, '')
    }

    uiArtifactUri = `${storeUri}/ui/repos/tree/General/${repoUrlParts[1]}/${result.request.pkg.name}/${tag}`
  }

  subjectSubHeader(
    subject?.name ?? 'Unknown',
    subject?.digest?.sha256 ?? 'Unknown',
    uiArtifactUri
  )
}

function errorHeaderRow() {
  return [
    { data: 'Type', header: true },
    { data: 'Published', header: true },
    { data: 'Details', header: true }
  ]
}

function errorRow(error: PublishFailedItem) {
  const predicateType =
    getStatement(error?.storeRequest)?.predicateType ?? 'Unknown'

  return [
    `\n\n\`${predicateType}\``,
    { data: '❌' },
    { data: error?.storeResponse?.message }
  ]
}

function successRows(result: PublishSuccessResponse | PublishErrorResponse) {
  // TODO merge this table creation with the one below
  // const rows: SummaryTableRow[] = [headerRow()]
  const rows: SummaryTableRow[] = []

  // successful published attestations
  if (result?.successes) {
    const items = groupSuccessByResource(result?.successes)

    items.forEach((success) => {
      const row = successItemToRow(success)
      rows.push(row)
    })
  }
  return rows
}

function header(heading: string) {
  //TODO make reference the repo's main branch.  Needs the repo to be public
  const headerImage =
    'https://raw.githubusercontent.com/gradle/develocity-provenance-governor-actions/cf78bf3e54d43cf9806a3ee3bbc7e2a4683ff786/src/publish/publish-header.svg'

  core.summary
    .addBreak()
    .addEOL()
    .addImage(headerImage, 'Attestation Publisher', {
      width: '100%',
      height: 'auto'
    })
    .addEOL()
    .addRaw(`# ${heading}`)
    .addEOL()
    .addEOL()
}

function subjectSubHeader(
  subjectPurl: string,
  digest: string,
  subjectDownloadUrl?: string
) {
  core.summary.addRaw('**Subject:** ')
  if (subjectDownloadUrl) {
    core.summary.addLink(subjectPurl, subjectDownloadUrl)
  } else {
    core.summary.addRaw('`').addRaw(subjectPurl).addRaw('`')
  }
  core.summary
    .addEOL()
    .addRaw('**Digest:** `')
    .addRaw(digest)
    .addRaw('`')
    .addEOL()
    .addEOL()
}

function headerRow() {
  return [
    { data: 'Type', header: true },
    { data: 'Published', header: true },
    { data: 'Attestation', header: true }
  ]
}

function groupSuccessByResource(
  items: PublishSuccessItem[]
): PublishSuccessItem[] {
  return [...items].sort((a, b) => {
    // First sort by storeType
    const storeTypeCompare = a.storeType.localeCompare(b.storeType)
    if (storeTypeCompare !== 0) return storeTypeCompare

    // Then by predicate_type
    return a.storeResponse.predicate_type.localeCompare(
      b.storeResponse.predicate_type
    )
  })
}

function successItemToRow(item: PublishSuccessItem): string[] {
  const statement = getStatement(item.storeRequest)
  const predicateType = item.storeResponse.predicate_type
  const downloadUri = `${item.storeUri}/ui/api/v1/download/${item.storeResponse.uri}`

  if (statement) {
    const predicate = JSON.stringify(statement.predicate, null, 2)

    const codeBlock = `\n\`\`\`json\n${predicate}\n\`\`\`\n`

    const open = codeBlock.length < 1000 ? 'open' : ''
    const detailsBlock = `\n<details ${open}>\n\n<summary>Attestation</summary>\n${codeBlock}\n\n</details>`

    return [
      `\n\n\`${predicateType}\``,
      '✅',
      `\n\n${detailsBlock}\n\n[Download](${downloadUri})\n`
    ]
  } else {
    return [
      `\n\n\`${predicateType}\``,
      '✅',
      `\n\n[Download](${downloadUri})\n`
    ]
  }
}

function getStatement(storeRequest?: StoreRequest) {
  if (!storeRequest?.body?.payload) {
    return null
  }
  const buffer = Buffer.from(storeRequest.body.payload, 'base64')
  const tmp = JSON.parse(buffer.toString('utf-8'))
  return tmp as Statement
}
