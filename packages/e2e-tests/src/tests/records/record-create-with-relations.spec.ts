import { expect } from "@playwright/test"
import { ZmajSdk } from "@zmaj-js/client-sdk"
import { times } from "@zmaj-js/common"
import { TCommentModel, TPostModel, TTagModel } from "@zmaj-js/test-utils"
import { test } from "../../setup/e2e-fixture.js"
import { getSdk } from "../../utils/e2e-get-sdk.js"

const suffix = "9k8fk3"

const deletePrevious = async (sdk: ZmajSdk): Promise<void> => {
	await sdk
		.collection<TCommentModel>("comments")
		.temp__deleteWhere({ filter: { body: { $like: "%" + suffix } } })
	await sdk
		.collection<TTagModel>("tags")
		.temp__deleteWhere({ filter: { name: { $like: "%" + suffix } } })
	await sdk
		.collection<TPostModel>("posts")
		.temp__deleteWhere({ filter: { title: { $like: "%" + suffix } } })
}

test.beforeEach(async () => {
	const sdk = getSdk()

	await deletePrevious(sdk)
	// create
	for (const i of times(6)) {
		await sdk.collection<TTagModel>("tags").createOne({ data: { name: `Tag ${i} ${suffix}` } })
		await sdk
			.collection<TCommentModel>("comments")
			.createOne({ data: { body: `Com ${i} ${suffix}` } })
	}
})
test.afterEach(async () => {
	const sdk = getSdk()
	await deletePrevious(sdk)
})

test("Create record with relations", async ({ page, postPage }) => {
	await postPage.goHome()
	await postPage.goToList()
	await postPage.clickCreateRecordButton()

	await page.getByLabel("Title").fill("MyTitle")
	await page.getByLabel("Body").fill("Hello World")
	await page.getByLabel("Likes").fill("1234")

	await page.getByRole("button", { name: "Add Comments" }).click()
	await page.getByRole("button", { name: /Com 1/ }).click()

	await page.getByRole("button", { name: "Add Comments" }).click()
	await page.getByRole("button", { name: /Com 3/ }).click()

	await page.getByRole("button", { name: "Add Tags" }).click()
	await page.getByRole("button", { name: /Tag 2/ }).click()

	await page.getByRole("button", { name: "Add Tags" }).click()
	await page.getByRole("button", { name: /Tag 3/ }).click()

	await page.getByRole("button", { name: "Save" }).click()

	await expect(page.locator(".crud-content h1")).toContainText("MyTitle")

	await expect(page.locator(".crud-content")).toContainText("Com 1")
	await expect(page.locator(".crud-content")).toContainText("Com 3")

	await expect(page.locator(".crud-content")).toContainText("Tag 2")
	await expect(page.locator(".crud-content")).toContainText("Tag 3")
})
