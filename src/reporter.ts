import { ResourceDescriptor } from './models.js'

export interface Reporter {
  report(status: number, subject: ResourceDescriptor, payload?: object): void
  reportSuccess(subject: ResourceDescriptor, payload?: object): void
  reportError(subject: ResourceDescriptor, payload?: object): void
}

export abstract class BaseReporter implements Reporter {
  report(status: number, subject: ResourceDescriptor, payload?: object) {
    if (status === 200 && payload) {
      this.reportSuccess(subject, payload)
    } else {
      this.reportError(subject, payload)
    }
  }

  abstract reportError(subject: ResourceDescriptor, payload?: object): void

  abstract reportSuccess(subject: ResourceDescriptor, payload?: object): void
}
