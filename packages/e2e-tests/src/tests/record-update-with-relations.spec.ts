import { expect, test } from "@playwright/test"
import { Struct, times } from "@zmaj-js/common"
import { TComment, TPost, TTag } from "@zmaj-js/test-utils"
import { createIdRegex } from "../utils/create-id-regex.js"
import { namespaceCollection } from "../utils/namespace-collection.js"
import { testSdk } from "../utils/test-sdk.js"

const commentsCrud = testSdk.collection<TComment>("comments")
const tagsCrud = testSdk.collection<TTag>("tags")
const postsCrud = testSdk.collection<TPost>("posts")

const suffix = "kdi22jk"

const originalPostTitle = "Hello Title" + suffix
const updatedPostTitle = "Updated Title" + suffix

const deletePrevious = async (): Promise<void> => {
	await commentsCrud.temp__deleteWhere({ filter: { body: { $like: "%" + suffix } } })
	await tagsCrud.temp__deleteWhere({ filter: { name: { $like: "%" + suffix } } })
	await postsCrud.temp__deleteWhere({ filter: { title: { $like: "%" + suffix } } })
}

let post: TPost
let tags: TTag[]
let comments: TComment[]

test.beforeEach(async () => {
	await deletePrevious()

	tags = await Promise.all(
		times(5, (i) => tagsCrud.createOne({ data: { name: `Tag ${i} ${suffix}` } })),
	)

	const toId = (val: Struct): any => val["id"]
	post = await postsCrud.createOne({
		data: {
			title: originalPostTitle,
			body: "Hello World",
			likes: 55,
			tags: { type: "toMany", added: tags.slice(0, 3).map(toId), removed: [] },
		},
	})

	comments = await Promise.all(
		times(5, (i) =>
			commentsCrud.createOne({
				data: {
					postId: i < 3 ? post.id : undefined, //
					body: `Com ${i} ${suffix}`,
				},
			}),
		),
	)
})
test.afterEach(async () => {
	await deletePrevious()
})

test("Update record with relations", async ({ page }) => {
	await namespaceCollection({ page, collection: "posts", suffix })
	await namespaceCollection({ page, collection: "comments", suffix })
	await namespaceCollection({ page, collection: "tags", suffix })
	// it throws without above 2 lines, there is no record context, see why
	await page.goto("http://localhost:7100/admin/")
	await expect(page).toHaveURL("http://localhost:7100/admin/")

	// const filter = encodeRaFilter({ title: originalPostTitle })
	// const query = qsStringify({ filter: JSON.stringify({ title: originalPostTitle }) })
	// await page.goto(`http://localhost:7100/admin/#/posts?${query}`)

	// click on first row, second column (first is checkbox)
	// await page.locator("tbody > tr:nth-child(1) > td:nth-child(2)").click()
	await page.goto(`http://localhost:7100/admin/#/posts/${post.id}/show`)
	// await expect(page).toHaveURL(createIdRegex("http://localhost:7100/admin/#/posts/$ID/show"))
	await expect(page.locator(".crud-content h1")).toContainText(originalPostTitle)

	// Click text=Edit
	// await page.locator("text=Edit").click()
	await page.getByRole("button", { name: /Edit/ }).click()
	await expect(page).toHaveURL(createIdRegex("http://localhost:7100/admin/#/posts/$ID"))

	await page.getByLabel("Title").fill(updatedPostTitle)
	await page.getByLabel("Body").fill("Hello World, I'm updated")
	await page.getByLabel("Likes").fill("5229")

	await page.getByRole("button", { name: /Remove Com 0/ }).click()
	await page.getByRole("button", { name: /Remove Com 2/ }).click()

	await page.getByRole("button", { name: "Add Comments" }).click()
	await page.getByRole("button", { name: /Com 3/ }).click()

	await page.getByRole("button", { name: "Add Comments" }).click()
	await page.getByRole("button", { name: /Com 4/ }).click()

	await page.getByRole("button", { name: /Remove Tag 1/ }).click()
	await page.getByRole("button", { name: /Remove Tag 2/ }).click()

	await page.getByRole("button", { name: "Add Tags" }).click()
	await page.getByRole("button", { name: /Tag 3/ }).click()

	await page.getByRole("button", { name: "Add Tags" }).click()
	await page.getByRole("button", { name: /Tag 4/ }).click()

	await page.getByRole("button", { name: "Save" }).click()

	await expect(page).toHaveURL(`http://localhost:7100/admin/#/posts/${post.id}/show`)
	await expect(page.locator(".crud-content h1")).toContainText(updatedPostTitle)

	await expect(page.locator(".crud-content")).not.toContainText("Com 0")
	await expect(page.locator(".crud-content")).not.toContainText("Com 2")
	await expect(page.locator(".crud-content")).toContainText("Com 1")
	await expect(page.locator(".crud-content")).toContainText("Com 3")
	await expect(page.locator(".crud-content")).toContainText("Com 4")

	await expect(page.locator(".crud-content")).not.toContainText("Tag 1")
	await expect(page.locator(".crud-content")).not.toContainText("Tag 2")
	await expect(page.locator(".crud-content")).toContainText("Tag 0")
	await expect(page.locator(".crud-content")).toContainText("Tag 3")
	await expect(page.locator(".crud-content")).toContainText("Tag 4")
})
