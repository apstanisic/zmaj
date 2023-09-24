import { expect } from "@playwright/test"
import { TComment, TPost, TTag } from "@zmaj-js/test-utils"
import { test } from "../../setup/e2e-fixture.js"

let randomPost: TPost
let tags: TTag[]
let comments: TComment[]

test.beforeEach(async ({ postFx }) => {
	const res = await postFx.crudWithRelationsSetup("CR")
	randomPost = res.randomPost
	tags = res.tags
	comments = res.comments
})
test.afterEach(async ({ postFx }) => {
	await postFx.removeTags(tags)
	await postFx.removeWhere({ id: randomPost.id })
})

test("Create record with relations", async ({ page, postPage }) => {
	await postPage.goToHomeUrl()
	await postPage.sidebarPostsLink.click()
	await postPage.createRecordButton.click()

	await postPage.titleInput.fill("MyTitle")
	await postPage.bodyInput.fill("Hello World")
	await postPage.likesInput.fill("1234")

	await page.getByRole("button", { name: "Add Comments" }).click()
	await page.getByRole("button", { name: /CRcm1/ }).click()

	await page.getByRole("button", { name: "Add Comments" }).click()
	await page.getByRole("button", { name: /CRcm3/ }).click()

	await page.getByRole("button", { name: "Add Tags" }).click()
	await page.getByRole("button", { name: /CRtag2/ }).click()

	await page.getByRole("button", { name: "Add Tags" }).click()
	await page.getByRole("button", { name: /CRtag3/ }).click()

	await page.getByRole("button", { name: "Save" }).click()

	await expect(page.locator(".crud-content h1")).toContainText("MyTitle")

	await expect(page.locator(".crud-content")).toContainText("CRcm1")
	await expect(page.locator(".crud-content")).toContainText("CRcm3")

	await expect(page.locator(".crud-content")).toContainText("CRtag2")
	await expect(page.locator(".crud-content")).toContainText("CRtag3")
})
