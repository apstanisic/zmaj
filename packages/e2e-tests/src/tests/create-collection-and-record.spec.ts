import { expect, test } from "@playwright/test"
import { createIdRegex } from "../utils/create-id-regex.js"
import { deleteCollectionByTable } from "../utils/infra-test-helpers.js"

const tableName = "all_test"
const collectionName = "allTest"

test.beforeEach(async () => deleteCollectionByTable(tableName))
test.afterAll(async () => deleteCollectionByTable(tableName))

test("Create Collection and record", async ({ page }) => {
	await page.goto("http://localhost:7100/admin/")
	await expect(page).toHaveURL("http://localhost:7100/admin/")

	// click collections in sidebar
	await page.getByRole("link", { name: "Collections" }).click()
	await expect(page).toHaveURL("http://localhost:7100/admin/#/zmajCollectionMetadata")

	// click create new collection in toolbar
	await page.getByRole("button", { name: /Create/ }).click()
	await expect(page).toHaveURL("http://localhost:7100/admin/#/zmajCollectionMetadata/create")

	// set table name
	await page.getByLabel("Table Name").fill(tableName)

	// next section
	await page.getByRole("button", { name: "Next" }).click()

	// create
	await page.getByRole("button", { name: /Save/ }).click()
	await expect(page).toHaveURL(
		createIdRegex("http://localhost:7100/admin/#/zmajCollectionMetadata/$ID/show"),
	)

	// click on fields
	await page.getByRole("tab", { name: "Fields" }).click()

	// click to add new field
	await page.getByRole("button", { name: "Add field" }).click()
	await expect(page).toHaveURL(
		"http://localhost:7100/admin/#/zmajFieldMetadata/create?source={%22collectionName%22:%22allTest%22}",
	)

	// set column name to be name
	await page.getByLabel("Column Name").fill("name")

	// next section
	await page.getByRole("button", { name: "Next" }).click()

	// next section
	await page.getByRole("button", { name: "Next" }).click()

	// create field
	await page.getByRole("button", { name: /Save/ }).click()
	await expect(page).toHaveURL(
		createIdRegex("http://localhost:7100/admin/#/zmajFieldMetadata/$ID/show"),
	)

	// go to all collections
	await page.getByRole("link", { name: "Collections" }).click()
	await expect(page).toHaveURL("http://localhost:7100/admin/#/zmajCollectionMetadata")

	// go to our collection
	await page.getByRole("link", { name: `Table: "${tableName}"` }).click()
	await expect(page).toHaveURL(
		createIdRegex("http://localhost:7100/admin/#/zmajCollectionMetadata/$ID/show"),
	)

	// click on relations tab
	await page.getByRole("tab", { name: "Relations" }).click()

	// add new relation
	await page.getByRole("button", { name: "Add relation" }).click()
	await expect(page).toHaveURL(
		"http://localhost:7100/admin/#/zmajRelationMetadata/create?disable_leftCollection=true&source={%22leftCollection%22:%22allTest%22}",
	)

	// set relation type
	await page.getByRole("button", { name: /Type/ }).click()
	await page.getByRole("option", { name: ">-- Many to One" }).getByText(">-- Many to One").click()

	// set right table
	await page.getByRole("button", { name: /Collection \(other side\)/ }).click()
	await page.getByRole("option", { name: "zmajUsers" }).getByText("zmajUsers").click()

	// set left property name
	await page.locator('input[name="left.propertyName"]').fill("user")

	// set left column name
	await page.locator('input[name="left.column"]').fill("user_id")

	// create relation
	await page.getByRole("button", { name: /Save/ }).click()
	await expect(page).toHaveURL(
		createIdRegex("http://localhost:7100/admin/#/zmajRelationMetadata/$ID/show"),
	)

	// go to table list page
	await page.getByRole("link", { name: "All Test" }).click()
	await expect(page).toHaveURL("http://localhost:7100/admin/#/allTest")

	// create new record
	await page.getByRole("button", { name: /Create/ }).click()
	await expect(page).toHaveURL("http://localhost:7100/admin/#/allTest/create")

	// set name
	await page.getByLabel("Name").fill("HelloWorld")

	// Fix this. Since this clicks on first dropdown
	// await page.getByLabel("Zmaj Users").getByRole("button", { name: "▼" }).click()

	await page.getByText("User", { exact: true }).click()
	// await page.getByLabel("Zmaj Users").click()
	await page.keyboard.press("Enter")

	await page.getByRole("button", { name: "admin@example.com" }).click()

	await page.getByRole("button", { name: /Save/ }).click()
	await expect(page).toHaveURL(createIdRegex("http://localhost:7100/admin/#/allTest/$ID/show"))

	await page.getByRole("link", { name: "Collections" }).click()
	await expect(page).toHaveURL("http://localhost:7100/admin/#/zmajCollectionMetadata")

	await page.getByRole("link", { name: tableName }).click()
	await expect(page).toHaveURL(
		createIdRegex("http://localhost:7100/admin/#/zmajCollectionMetadata/$ID/show"),
	)

	await page.getByRole("button", { name: /Delete/ }).click()

	await page.getByRole("button", { name: "Confirm" }).click()
	await expect(page).toHaveURL("http://localhost:7100/admin/#/zmajCollectionMetadata")
})
