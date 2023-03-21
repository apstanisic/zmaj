import { expect, test } from "@playwright/test"
import { TComment, TPost, TTag } from "@zmaj-js/test-utils"
import { range } from "radash"
import { namespaceTestCollections } from "../utils/namespace-collection.js"
import { testSdk } from "../utils/test-sdk.js"

const commentsCrud = testSdk.collection<TComment>("comments")
const tagsCrud = testSdk.collection<TTag>("tags")
const postsCrud = testSdk.collection<TPost>("posts")

const suffix = "9k8fk3"

const deletePrevious = async (): Promise<void> => {
	await Promise.all([
		commentsCrud.temp__deleteWhere({ filter: { body: { $like: "%" + suffix } } }),
		tagsCrud.temp__deleteWhere({ filter: { name: { $like: "%" + suffix } } }),
		postsCrud.temp__deleteWhere({ filter: { title: { $like: "%" + suffix } } }),
	])
}

test.beforeEach(async () => {
	await deletePrevious()
	await Promise.all(
		range(0, 5, async (i) => tagsCrud.createOne({ data: { name: `Tag ${i} ${suffix}` } })),
	)

	await Promise.all(
		range(0, 5, async (i) =>
			commentsCrud.createOne({
				data: {
					body: `Com ${i} ${suffix}`,
				},
			}),
		),
	)
})
test.afterEach(async () => {
	await deletePrevious()
})

test("Create record with relations", async ({ page }) => {
	await namespaceTestCollections({ page, suffix })
	// it throws without above 2 lines, there is no record context, see why
	await page.goto("http://localhost:7100/admin/")
	await expect(page).toHaveURL("http://localhost:7100/admin/")

	await page.goto("http://localhost:7100/admin/#/posts/create")

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
