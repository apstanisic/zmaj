import { TComment, TPost, TTag } from "@zmaj-js/test-utils"
import { test } from "../../setup/e2e-fixture.js"
import { getUniqueTitle } from "../../setup/e2e-unique-id.js"

let randomPost: TPost
let tags: TTag[]
let comments: TComment[]

test.beforeEach(async ({ orm, postItem, postFx }) => {
	// create random post to assign comments that do not belong to main post
	const res = await postFx.crudWithRelationsSetup("UP", postItem)
	randomPost = res.randomPost
	tags = res.tags
	comments = res.comments
})

test.afterEach(async ({ postFx }) => {
	await postFx.removeWhere({ id: randomPost.id })
	await postFx.removeTags(tags)
})

test("Update record with relations", async ({ page, postPage, postItem }) => {
	await postPage.goToHomeUrl()
	await postPage.sidebarPostsLink.click()
	await postPage.clickOnShowRecord(postItem.id)
	await postPage.editButton.click()

	const newTitle = getUniqueTitle()

	await postPage.titleInput.fill(newTitle)
	await postPage.bodyInput.fill("Hello World, I'm updated")
	await postPage.likesInput.fill("5229")

	// await page.getByRole("button", { name: /Remove Com 0/ }).click()
	// await page.getByRole("button", { name: /Remove Com 2/ }).click()

	await page.getByRole("button", { name: "Add comments" }).click()
	await page.getByRole("button", { name: /UPcm3/ }).click()

	await page.getByRole("button", { name: "Add comments" }).click()
	await page.getByRole("button", { name: /UPcm4/ }).click()

	await page.getByRole("button", { name: /Remove UPtag1/ }).click()
	await page.getByRole("button", { name: /Remove UPtag2/ }).click()

	await page.getByRole("button", { name: "Add tags" }).click()
	await page.getByRole("button", { name: /UPtag3/ }).click()

	await page.getByRole("button", { name: "Add tags" }).click()
	await page.getByRole("button", { name: /UPtag4/ }).click()

	await postPage.saveButton.click()

	await postPage.isOnShowPageUrl(postItem.id)
	await postPage.hasInBody(newTitle)

	// Can't detach comment, since it must belong somewhere
	// await postPage.notHasCrudContent("cm0")
	// await postPage.notHasCrudContent("cm2")
	await postPage.hasInBody("UPcm1")
	await postPage.hasInBody("UPcm3")
	await postPage.hasInBody("UPcm4")

	await postPage.notHasInBody("UPtag1")
	await postPage.notHasInBody("UPtag2")
	await postPage.hasInBody("UPtag0")
	await postPage.hasInBody("UPtag3")
	await postPage.hasInBody("UPtag4")
})
