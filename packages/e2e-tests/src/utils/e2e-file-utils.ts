import { APIRequestContext } from "@playwright/test"
import { ZmajSdk } from "@zmaj-js/client-sdk"
import { FileModel, throwErr } from "@zmaj-js/common"
import { readFile } from "fs/promises"
import { lookup } from "mime-types"
import path, { dirname, join } from "node:path"
import { extname } from "path"
import { fileURLToPath } from "url"
import { e2eRoot } from "../setup/e2e-env.js"
import { getOrm } from "../setup/e2e-orm.js"
import { getUniqueId } from "../setup/e2e-unique-id.js"
import { getSdk } from "./e2e-get-sdk.js"
import { playwrightAuthorizationHeader } from "./test-sdk.js"

export async function deleteTestFile(name: string, sdk?: ZmajSdk): Promise<void> {
	await getSdk().files.temp__deleteWhere({ filter: { name } })
}

export async function uploadTestFile({
	request,
	assetsPath,
	customName,
}: {
	request: APIRequestContext
	assetsPath: string
	customName?: string
}): Promise<void> {
	const joinedPath = path.join(currentFolder, "../../assets/", assetsPath)
	const file = await readFile(joinedPath)
	const name = customName ?? assetsPath.split("/").at(-1) ?? throwErr("452897")
	await deleteTestFile(name)
	const result = await request.post("http://localhost:7100/api/files", {
		headers: { Authorization: playwrightAuthorizationHeader },
		multipart: { file: { buffer: file, name, mimeType: "image/png" } },
	})
	if (!result.ok) throwErr()
}

const currentFolder = dirname(fileURLToPath(import.meta.url))

async function deleteFile(name: string): Promise<void> {
	const orm = await getOrm()
	await orm.repoManager.getRepo(FileModel).deleteWhere({ where: { name } })
	// TODO It remains on disk.
	// doesn't matter, volume is deleted in the end
}

async function readAsset(
	name: string,
	newName?: string,
): Promise<{ buffer: Buffer; name: string; mimeType: string }> {
	const path = join(e2eRoot, "./assets", name)
	const fileBuffer = await readFile(path)
	return {
		buffer: fileBuffer,
		mimeType: lookup(extname(name)) || "application/octet-stream",
		name: newName ?? name,
	}
}

function getRandomName(ext: string): string {
	return `file_${getUniqueId()}${ext}`
}

export const fileUtils = {
	getRandomName,
	deleteFile,
	__upload: uploadTestFile,
	readAsset,
}
