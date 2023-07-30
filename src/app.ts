import axios from 'axios';
import dotenv from 'dotenv';
import fs from "fs";
import { App } from "octokit";
import { requestData } from './api';
import { Discussion, GrcAssetData, Release, ReleaseAsset, Resource } from './types';

dotenv.config()
main()

async function main() {
    const app = new App({
        appId: process.env.APP_ID,
        privateKey: process.env.APP_PRIVATE_KEY,
    });
    for await (const { octokit, repository } of app.eachRepository.iterator()) {
        console.log("start process repo %s", repository.full_name);
        if ("public" == repository.visibility) {
            const { discussions, releases } = await requestData(octokit, repository.owner.login, repository.name)
            const result: Resource[] = []
            for (const release of releases) {
                console.log("add mod %s", release.tagName);
                const discussion = getDiscussion(discussions, release);
                if (discussion == undefined) {
                    console.warn("mod %s miss discussion", release.tagName);
                    continue;
                }
                const assets = getAssets(release)
                const downloadCount = getDownloadCount(assets);
                const grcAssetData = await getGrcAssetData(release);
                const cover = getCover(discussion.body)
                result.push({
                    id: grcAssetData?.id ?? release.tagName,
                    name: grcAssetData?.name ?? release.name,
                    description: limitDescription(grcAssetData?.description ?? release.description),
                    cover: grcAssetData?.cover ?? cover,
                    author: grcAssetData?.author ?? repository.owner.login,
                    category: grcAssetData?.category ?? 'mod',
                    tags: grcAssetData?.tags ?? [],
                    repo: repository.owner.login + "/" + repository.name,
                    created: new Date(release.createdAt).getTime(),
                    updated: new Date(release.updatedAt).getTime(),
                    downloadCount: downloadCount,
                    releaseNodeId: release.id,
                    discussionNodeId: discussion.id
                })
            }
            console.log("mod count: %s", result.length);
            fs.writeFileSync("resources.json", JSON.stringify(result))
        } else {
            console.warn("repo %s not is public", repository.full_name);
        }
    }
}

function getDiscussion(discussions: Discussion[], release: Release): Discussion | undefined {
    if (discussions.length > 0) {
        for (const discussion of discussions) {
            if (discussion.title === release.tagName) {
                return discussion;
            }
        }
    }
    return undefined;
}

function getAssets(release: Release): ReleaseAsset[] {
    return release.releaseAssets.nodes.filter(it => 'application/zip' === it.contentType);
}

function getCover(description: string): string | undefined {
    const re = new RegExp('\\!\\[\\S+\\]\\(([a-zA-z]+://[^\\s]*)\\)')
    const reResult = re.exec(description);
    if (reResult && reResult.length > 1) return reResult[1]
    else return undefined
}

async function getGrcAssetData(release: Release): Promise<GrcAssetData | undefined> {
    const assets = release.releaseAssets.nodes.filter(it => 'application/json' === it.contentType && it.name.startsWith('GrcMetaData'));
    if (assets.length > 0) {
        const { data } = await axios.get(assets[0].downloadUrl)
        return data
    } else {
        return undefined
    }
}

function getDownloadCount(assets: ReleaseAsset[]): number {
    let downloadCount = 0;
    for (const asset of assets) {
        downloadCount += asset.downloadCount;
    }
    return downloadCount;
}

function limitDescription(description: string): string {
    return description.slice(0, 100);
}
