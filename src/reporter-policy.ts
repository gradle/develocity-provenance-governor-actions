import { BaseReporter, Reporter } from './reporter.js'
import { ResourceDescriptor } from './models.js'

export function createPolicyReporter(): Reporter {
  return new PolicySummaryReporter()
}

export class PolicySummaryReporter extends BaseReporter {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  reportError(subject: ResourceDescriptor, result?: object): void {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  reportSuccess(subject: ResourceDescriptor, result?: object): void {}
}
