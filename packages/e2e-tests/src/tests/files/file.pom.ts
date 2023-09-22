import { FileChooser, Page, expect } from "@playwright/test"
import { ZmajSdk } from "@zmaj-js/client-sdk"
import { FileModel } from "@zmaj-js/common"
import { FormData } from "formdata-node"
import { lookup } from "mime-types"
import { File } from "node:buffer"
import { readFile } from "node:fs/promises"
import { extname, join, parse } from "node:path"
import { Orm, OrmRepository } from "zmaj"
import { ZmajCrudPage } from "../../setup/ZmajCrudPage.js"
import { e2eRoot } from "../../setup/e2e-env.js"
import { getUniqueId } from "../../setup/e2e-unique-id.js"

export class FilePage extends ZmajCrudPage {
	override title = "Files"
	constructor(
		page: Page,
		orm: Orm,
		protected sdk: ZmajSdk,
	) {
		super(page, orm, "/#/zmajFiles")
	}

	get repo(): OrmRepository<FileModel> {
		return this.orm.repoManager.getRepo(FileModel)
	}

	db = {
		deleteFileByName: async (name: string) => this.repo.deleteWhere({ where: { name } }),
		findByName: async (name: string) => this.repo.findOneOrThrow({ where: { name } }),
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

	async clickUploadButton(): Promise<void> {
		await this.page.getByRole("button", { name: "Upload" }).click()
	}

	async openFilePicker(): Promise<FileChooser> {
		// https://playwright.dev/docs/input#upload-files
		const [fileChooser] = await Promise.all([
			this.page.waitForEvent("filechooser"),
			this.page.getByText("Drop some files here, or click to select files").click(),
		])
		return fileChooser
	}

	async pressEscape(): Promise<void> {
		await this.page.keyboard.press("Escape")
	}

	async uploadSuccessToast(): Promise<void> {
		await this.hasBodyContent("Upload successful")
	}

	async isShowingFileName(fileName: string): Promise<void> {
		await this.hasCrudContent(parse(fileName).name)
	}

	async clickOnFileName(name: string): Promise<void> {
		await this.page.getByText(name).click()
	}

	async isOnFileShowPage(name: string): Promise<void> {
		const file = await this.db.findByName(name)
		await this.isOnShowPage(file.id)
	}
	async isOnFileEditPage(name: string): Promise<void> {
		const file = await this.db.findByName(name)
		await this.isOnEditPage(file.id)
	}

	async clickOnDownloadButtonAndDownloadSingleFile(): Promise<void> {
		const [download] = await Promise.all([
			this.page.waitForEvent("download"),
			await this.page.getByRole("button", { name: "Download" }).click(),
		])
		const fail = await download.failure()
		expect(fail).toBeNull()
	}

	async uploadFile(assetPath: string, newName?: string): Promise<void> {
		const file = await this.readAsset(assetPath, newName)
		const fileBuffer = new File([file.buffer], file.name, { type: file.mimeType })
		await this.sdk.files.upload({
			file: fileBuffer as any, //
			formData: new FormData() as any, //
		})
	}

	async itShouldContainImagesAmount(n: number): Promise<void> {
		await expect(this.page.locator(".crud-content img")).toHaveCount(n)
	}

	async selectNthFileInList(n: number): Promise<void> {
		await this.page
			.getByRole("checkbox", { name: /Select file/ })
			.nth(n)
			.click()
	}

	async clickOnDownloadButton(): Promise<void> {
		await this.page.getByRole("button", { name: "Download" }).click()
	}

	/**
	 * Returns function that get download amount
	 */
	startCountingDownloads(): () => number {
		let downloadCount = 0

		this.page.on("download", async (download) => {
			if (await download.failure()) return
			downloadCount++
		})

		return () => downloadCount
	}
}
