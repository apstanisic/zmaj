import { APIRequestContext } from "@playwright/test"
import { ZmajSdk } from "@zmaj-js/client-sdk"
import { throwErr } from "@zmaj-js/common"
import { readFile } from "fs/promises"
import path, { dirname } from "path"
import { fileURLToPath } from "url"
import { getSdk } from "./getSdk.js"
import { playwrightAuthorizationHeader } from "./test-sdk.js"

export async function deleteTestFile(name: string, sdk?: ZmajSdk): Promise<void> {
	await (sdk ?? getSdk()).files.temp__deleteWhere({ filter: { name } })
	// const toDelete = await testSdk.files.getMany({ filter: { name } })
	// await Promise.all(toDelete.data.map(async (f) => testSdk.files.deleteById({ id: f.id })))
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
