import { faker } from "@faker-js/faker"
import { times } from "@zmaj-js/common"
import { TComment, TCommentModel, TPost, TPostTagModel, TTag, TTagModel } from "@zmaj-js/test-utils"
import { test } from "../../setup/e2e-fixture.js"
import { getUniqueTitle, getUniqueWord } from "../../setup/e2e-unique-id.js"

let randomPost: TPost
let tags: TTag[]
let comments: TComment[]

test.beforeEach(async ({ orm, postItem, postFx }) => {
	// create random post to assign comments that do not belong to main post
	randomPost = await postFx.create()

	tags = await orm.repoManager
		.getRepo(TTagModel)
		.createMany({ data: times(5, (i) => ({ name: `tag${i}${getUniqueWord()}` })) })

	await orm.repoManager.getRepo(TPostTagModel).createMany({
		data: tags.slice(0, 3).map((tag) => ({ tagId: tag.id, postId: postItem.id })),
	})

	comments = await orm.repoManager.getRepo(TCommentModel).createMany({
		data: times(5, (i) => ({
			body: `cm${i}${faker.lorem.paragraph()}`,
			postId: i < 3 ? postItem.id : randomPost.id,
		})),
	})
})

test.afterEach(async ({ postFx }) => {
	await postFx.removeWhere({ id: randomPost.id })
	await postFx.removeTags(tags)
})

test("Update record with relations", async ({ page, postPage, postItem }) => {
	await postPage.goHome()
	await postPage.goToList()
	await postPage.goToShow(postItem.id)
	await postPage.clickEditButton()

	const newTitle = getUniqueTitle()

	await page.getByLabel("Title").fill(newTitle)
	await page.getByLabel("Body").fill("Hello World, I'm updated")
	await page.getByLabel("Likes").fill("5229")

	// await page.getByRole("button", { name: /Remove Com 0/ }).click()
	// await page.getByRole("button", { name: /Remove Com 2/ }).click()

	await page.getByRole("button", { name: "Add Comments" }).click()
	await page.getByRole("button", { name: /cm3/ }).click()

	await page.getByRole("button", { name: "Add Comments" }).click()
	await page.getByRole("button", { name: /cm4/ }).click()

	await page.getByRole("button", { name: /Remove tag1/ }).click()
	await page.getByRole("button", { name: /Remove tag2/ }).click()

	await page.getByRole("button", { name: "Add Tags" }).click()
	await page.getByRole("button", { name: /tag3/ }).click()

	await page.getByRole("button", { name: "Add Tags" }).click()
	await page.getByRole("button", { name: /tag4/ }).click()

	await postPage.clickSaveButton()

	await postPage.isOnShowPage(postItem.id)
	await postPage.hasCrudContent(newTitle)

	// Can't detach comment, since it must belong somewhere
	// await postPage.notHasCrudContent("cm0")
	// await postPage.notHasCrudContent("cm2")
	await postPage.hasCrudContent("cm1")
	await postPage.hasCrudContent("cm3")
	await postPage.hasCrudContent("cm4")

	await postPage.notHasCrudContent("tag1")
	await postPage.notHasCrudContent("tag2")
	await postPage.hasCrudContent("tag0")
	await postPage.hasCrudContent("tag3")
	await postPage.hasCrudContent("tag4")
})
