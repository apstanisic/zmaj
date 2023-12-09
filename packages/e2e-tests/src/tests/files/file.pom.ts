import { FileChooser, Page, expect } from "@playwright/test"
import { ZmajSdk } from "@zmaj-js/client-sdk"
import { FileInfo, FileModel } from "@zmaj-js/common"
import { FormData } from "formdata-node"
import { lookup } from "mime-types"
import { File } from "node:buffer"
import { readFile } from "node:fs/promises"
import { extname, join, parse } from "node:path"
import { Orm, OrmRepository, RepoFilter } from "zmaj"
import { ZmajCrudPage } from "../../setup/ZmajCrudPage.js"
import { e2eRoot } from "../../setup/e2e-env.js"
import { getUniqueId } from "../../setup/e2e-unique-id.js"
import { SelectorFixture } from "../../setup/selector.fx.js"

export class FilePageFx extends ZmajCrudPage {
	override title = "Files"
	constructor(
		page: Page,
		protected sdk: ZmajSdk,
	) {
		super(page, "/#/zmajFiles")
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

	async isOnFileShowPage(file: FileInfo): Promise<void> {
		await this.isOnShowPage(file.id)
	}
	async isOnFileEditPage(file: FileInfo): Promise<void> {
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

	async selectNthFileInList(selector: SelectorFixture, n: number): Promise<void> {
		await selector.checkboxInput("Select file").nth(n).click()
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

export class FileUtilsFx {
	constructor(
		private orm: Orm,
		protected sdk: ZmajSdk,
	) {}

	get repo(): OrmRepository<FileModel> {
		return this.orm.repoManager.getRepo(FileModel)
	}

	async deleteFileByName(name: string): Promise<void> {
		await this.repo.deleteWhere({ where: { name } })
	}

	async deleteWhere(where: RepoFilter<FileModel>): Promise<void> {
		await this.repo.deleteWhere({ where })
	}

	findByName(name: string): Promise<FileInfo> {
		return this.repo.findOneOrThrow({ where: { name } })
	}

	getRandomName(ext: string): string {
		return `file_${getUniqueId()}${ext}`
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

	async uploadFile(assetPath: string, newName?: string): Promise<FileInfo> {
		const file = await this.readAsset(assetPath, newName)
		const fileBuffer = new File([file.buffer], file.name, { type: file.mimeType })
		const result = await this.sdk.files.upload({
			file: fileBuffer as any, //
			formData: new FormData() as any, //
		})
		return result as FileInfo
	}
}
