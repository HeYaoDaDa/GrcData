import { Octokit } from "octokit";
import { Discussion, GraphArray, Release, arrayPackage, discussionFields, releaseAssetFields, releaseFields } from "./types";

export async function requestData(octokit: Octokit, repoOwner: string, repoName: string) {
    const data: {
        repository: {
            releases: GraphArray<Release>
            discussions: GraphArray<Discussion>
        }
    } = await octokit.graphql(`{
  repository(owner: "${repoOwner}", name: "${repoName}") {
    releases(first: 100) {
      ${arrayPackage("...releaseFields")}
    }
    discussions(states: OPEN, first: 100) {
      ${arrayPackage("...discussionFields")}
    }
  }
}`+ releaseAssetFields + releaseFields + discussionFields);
    const releases = data.repository.releases.nodes
    const discussions = data.repository.discussions.nodes
    return { releases, discussions }
}