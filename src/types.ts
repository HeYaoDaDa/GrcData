export interface GraphArray<T> {
  totalCount: number
  nodes: T[]
}

export function arrayPackage(nodeFields: string) {
  return `
totalCount
nodes {
    ${nodeFields}
}`;
}

export interface ReleaseAsset {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  downloadCount: number
  downloadUrl: string
  size: number
  contentType: string
}

export const releaseAssetFields = `
fragment releaseAssetFields on ReleaseAsset {
  id
  name
  createdAt
  updatedAt
  downloadCount
  downloadUrl
  size
  contentType
}`;

export interface Release {
  id: string
  name: string
  tagName: string
  description: string
  createdAt: string
  updatedAt: string
  releaseAssets: GraphArray<ReleaseAsset>
}

export const releaseFields = `
fragment releaseFields on Release {
  id
  name
  tagName
  description
  createdAt
  updatedAt
  releaseAssets(last: 100) {
    ${arrayPackage('...releaseAssetFields')}
  }
}`;

export interface Discussion {
  id: string
  title: string
  body: string
}

export const discussionFields = `
fragment discussionFields on Discussion {
  id
  title
  body
}`;

export interface GrcAssetData {
  id?: string
  name?: string
  description?: string
  cover?: string
  author?: string
  category?: string
  tags?: string[]
}

export interface Resource {
  id: string
  name: string
  description: string
  cover?: string
  author: string
  category: string
  tags: string[]
  repo: string
  created: number
  updated: number
  downloadCount: number
  releaseNodeId: string
  discussionNodeId: string
}