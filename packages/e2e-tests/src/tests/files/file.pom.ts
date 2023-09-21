import { Page } from "@playwright/test"
import { FileModel } from "@zmaj-js/common"
import { lookup } from "mime-types"
import { readFile } from "node:fs/promises"
import { extname, join } from "node:path"
import { Orm, OrmRepository } from "zmaj"
import { ZmajPage } from "../../setup/ZmajPage.js"
import { e2eRoot } from "../../setup/e2e-env.js"
import { getUniqueId } from "../../setup/e2e-unique-id.js"

export class FilePage extends ZmajPage {
	constructor(page: Page, orm: Orm) {
		super(page, orm, "/#/zmajFiles")
	}

	get repo(): OrmRepository<FileModel> {
		return this.orm.repoManager.getRepo(FileModel)
	}

	db = {
		deleteFileByName: async (name: string) => this.repo.deleteWhere({ where: { name } }),
		getRandomName(ext: string): string {
			return `file_${getUniqueId()}${ext}`
		},
	}

	async readAsset(
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

	uploadFile(assetPath: string) {}
}
