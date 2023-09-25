import { faker } from "@faker-js/faker"
import { test } from "../../setup/e2e-fixture.js"

test("Update User", async ({ page, userPage, userItem }) => {
	const newEmail = faker.internet.email({ provider: "example.test" })

	await userPage.goHome()
	await userPage.goToList()
	await userPage.goToShow(userItem.id)
	await userPage.clickEditButtonInList(userItem.id)

	await page.getByLabel(/^Email$/).fill(newEmail)
	await page.getByLabel("First Name").fill("Changed")
	await page.getByLabel("Last Name").fill("Data")

	await page.getByRole("button", { name: /Active/ }).click()
	await page.getByText("Disabled").click()

	await page.getByRole("button", { name: /Admin/ }).click()

	await page.getByRole("button", { name: /Public/ }).click()

	await userPage.clickSaveButton()
	await userPage.isOnShowPage(userItem.id)

	await userPage.elementUpdatedVisible()

	await userPage.hasCrudContent(newEmail)
	await userPage.hasCrudContent("Changed")
	await userPage.hasCrudContent("Data")
	await userPage.hasCrudContent("disabled")
	await userPage.hasCrudContent("Public")
})
