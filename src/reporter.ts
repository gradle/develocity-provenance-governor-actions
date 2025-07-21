import * as core from '@actions/core'
import { SummaryTableRow } from '@actions/core/lib/summary.js'
import {
  PublishSuccessItem,
  SuccessResponse,
  ErrorResponse,
  PublishFailedItem,
  StoreRequest,
  ResourceDescriptor
} from './publish-models.js'
import { Statement } from './statement.js'

export interface Reporter {
  reportSuccess(subject: ResourceDescriptor, result?: SuccessResponse): void
  reportError(subject: ResourceDescriptor, result?: ErrorResponse): void
}

export function createReporter(): Reporter {
  return new SummaryReporter()
}

export class SummaryReporter implements Reporter {
  report(
    status: number,
    subject: ResourceDescriptor,
    result?: SuccessResponse | ErrorResponse
  ) {
    if (status === 200 && result) {
      this.reportSuccess(subject, result as SuccessResponse)
    } else {
      this.reportError(subject, result as ErrorResponse)
    }
  }

  reportSuccess(subject: ResourceDescriptor, result: SuccessResponse) {
    core.info(
      `Attestation publishing for subject: ${subject.name} completed successfully!`
    )

    header('Attestations Published')
    subjectInfo(subject, result)

    const items = groupSuccessByResource(result.successes)

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    items.forEach(([_, successes]) => {
      // TODO merge this table creation with the one below
      const rows: SummaryTableRow[] = [headerRow()]

      successes.forEach((success) => {
        const row = successItemToRow(success)
        rows.push(row)
        // console.log(` ${row}`)
      })

      core.summary.addTable(rows)
    })
  }

  reportError(subject: ResourceDescriptor, result?: ErrorResponse) {
    header('Attestations Publishing Failed')

    if (result?.title) {
      core.summary.addRaw('**Error:** ').addRaw(result?.title).addEOL().addEOL()
    }
    if (result?.detail) {
      core.summary.addRaw('> ').addRaw(result?.detail).addEOL().addEOL()
    }
    if (result?.type) {
      core.summary.addRaw('**Type:** ').addRaw(result?.type).addEOL().addEOL()
    }

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
  subject: ResourceDescriptor,
  result?: SuccessResponse | ErrorResponse
) {
  let uiArtifactUri
  if (result) {
    const repoUrlParts = result.request.criteria.repositoryUrl.split('/')
    const tag = result.request.pkg.version

    let storeUri

    // get the artifact uri from the result items
    if (result && result.successes && result.successes[0]) {
      storeUri = result.successes[0].storeUri
    } else if ('errors' in result && result.errors && result.errors[0]) {
      storeUri = result.errors[0].storeUri
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

function successRows(result: SuccessResponse | ErrorResponse) {
  // TODO merge this table creation with the one below
  // const rows: SummaryTableRow[] = [headerRow()]
  const rows: SummaryTableRow[] = []

  // successful published attestations
  if (result?.successes) {
    const items = groupSuccessByResource(result?.successes)

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    items.forEach(([_, successes]) => {
      successes.forEach((success) => {
        const row = successItemToRow(success)
        rows.push(row)
        // console.log(` ${row}`)
      })

      // core.summary.addTable(rows)
    })
  }
  return rows
}

function header(heading: string) {
  core.summary.addBreak().addEOL().addRaw(`## ${heading}`).addEOL().addEOL()
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
    core.summary.addRaw(subjectPurl)
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
): [string, PublishSuccessItem[]][] {
  // First, create a grouped structure using Map
  const groupedSuccesses = items.reduce((acc, success) => {
    const key = `${success.storeType}-${success.storeRequest.uri}`
    if (!acc.has(key)) {
      acc.set(key, [])
    }
    acc.get(key)?.push(success)
    return acc
  }, new Map<string, PublishSuccessItem[]>())

  // Convert to array and sort
  return Array.from(groupedSuccesses.entries()).sort(([keyA], [keyB]) => {
    const [storeTypeA, uriA] = keyA.split('-')
    const [storeTypeB, uriB] = keyB.split('-')

    // First sort by storeType
    const storeTypeCompare = storeTypeA.localeCompare(storeTypeB)
    if (storeTypeCompare !== 0) return storeTypeCompare

    // Then by resourceUri
    return uriA.localeCompare(uriB)
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
