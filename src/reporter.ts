import * as core from '@actions/core'
import {
  BaseCriteria,
  BaseErrorResponse,
  BaseRequest,
  BaseSuccessResponse
} from './models.js'

export interface Reporter<Subject, Success, Error> {
  report(status: number, subject: Subject, payload: Success | Error): void
  reportSuccess(subject: Subject, payload: Success): void
  reportError(subject: Subject, payload: Error): void
}

export abstract class BaseReporter<
  Subject,
  Success extends BaseSuccessResponse<BaseRequest<BaseCriteria>>,
  Error extends BaseErrorResponse<unknown>
> implements Reporter<Subject, Success, Error>
{
  report(status: number, subject: Subject, payload: Success | Error) {
    if (status === 200 && payload) {
      this.reportSuccess(subject, payload as Success)
    } else {
      this.reportError(subject, payload as Error)
    }
  }

  abstract reportSuccess(subject: Subject, payload: Success): void

  abstract reportError(subject: Subject, payload: Error): void
}

export function reportProblemDetails(result: BaseErrorResponse<unknown>) {
  if (result?.title) {
    core.summary.addRaw('**Error:** ').addRaw(result?.title).addEOL().addEOL()
  }
  if (result?.detail) {
    core.summary.addRaw('> ').addRaw(result?.detail).addEOL().addEOL()
  }
  if (result?.type) {
    core.summary.addRaw('**Type:** ').addRaw(result?.type).addEOL().addEOL()
  }
}
