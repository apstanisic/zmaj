import { expect, test } from "@playwright/test"
import { sleep, throwErr } from "@zmaj-js/common"
import { fileUtils, uploadTestFile } from "../utils/e2e-file-utils.js"
import { toRaQuery } from "../utils/test-sdk.js"

const img1 = "test-image-download-multiple-1.png"
const img2 = "test-image-download-multiple-2.png"
const imgName1 = "img-multiple-1k9o"
const imgName2 = "img-multiple-2k3k"

test.beforeEach(async ({ request }) => {
	await uploadTestFile({ request, assetsPath: img1, customName: imgName1 })
	await uploadTestFile({ request, assetsPath: img2, customName: imgName2 })
})
test.afterAll(async () => {
	await fileUtils.deleteFile(imgName1)
	await fileUtils.deleteFile(imgName2)
})

test("Download multiple files", async ({ page }) => {
	await page.goto("http://localhost:7100/admin/")
	await expect(page).toHaveURL("http://localhost:7100/admin/")

	await page.getByRole("link", { name: "Files" }).click()
	const query = toRaQuery({ filter: { name: { $in: [imgName1, imgName2] } } })
	await page.goto(`http://localhost:7100/admin/#/zmajFiles?${query}`)
	await expect(page).toHaveURL(`http://localhost:7100/admin/#/zmajFiles?${query}`)

	await page
		.getByRole("button", { name: /img-multiple-1k9o/ })
		.locator('input[type="checkbox"]')
		.click()
	await page
		.getByRole("button", { name: /img-multiple-2k3k/ })
		.locator('input[type="checkbox"]')
		.click()

	let downloadCount = 0

	// we expect 2 downloads, so we can't simply react to event (i think??)
	// eslint-disable-next-line @typescript-eslint/no-misused-promises
	page.on("download", async (download) => {
		const fail = await download.failure()
		if (fail === null) {
			downloadCount++
		} else {
			throwErr("378642")
		}
	})

	await page.getByRole("button", { name: "Download" }).click()

	// wait for up to 5 seconds after clicking download button for files to be downloaded
	let secWait = 5
	while (downloadCount < 2 && secWait > 0) {
		await sleep(1000)
		secWait -= 1
	}
	expect(downloadCount).toEqual(2)
	await expect(page).toHaveURL(`http://localhost:7100/admin/#/zmajFiles?${query}`)
})
