import { ResourceDescriptor } from './publish-models.js'

export interface Statement {
  _type: 'https://in-toto.io/Statement/v1'
  subject: ResourceDescriptor[]
  predicateType: string
  predicate: object
  createdAt: string
  createdBy: string
}
