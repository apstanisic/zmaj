import { User, UserCreateDto } from "@zmaj-js/common"
import { test } from "../../setup/e2e-fixture.js"
import { getUniqueEmail } from "../../setup/e2e-unique-id.js"

const originalEmail = getUniqueEmail()
const updatedEmail = getUniqueEmail()

let user: User

test.beforeEach(async ({ userPage }) => {
	await userPage.db.removeByEmail(originalEmail)
	await userPage.db.removeByEmail(updatedEmail)
	user = await userPage.db.createOne(
		new UserCreateDto({
			email: originalEmail,
			confirmedEmail: true,
			status: "active",
			firstName: "Test",
			lastName: "Smith",
		}),
	)
})
test.afterEach(async ({ userPage }) => {
	await userPage.db.removeByEmail(originalEmail)
	await userPage.db.removeByEmail(updatedEmail)
})

test("Update User", async ({ page, userPage }) => {
	await userPage.goHome()
	await userPage.goToList()
	await userPage.goToShow(user.id)
	await userPage.clickEditButton(user.id)

	await page.getByLabel(/^Email$/).fill(updatedEmail)
	await page.getByLabel("First Name").fill("Changed")
	await page.getByLabel("Last Name").fill("Data")

	await page.getByRole("button", { name: /Active/ }).click()
	await page.getByText("Disabled").click()

	await page.getByRole("button", { name: /Public/ }).click()

	await page.getByRole("button", { name: "Admin" }).click()

	await userPage.clickSaveButton()
	await userPage.isOnShowPage(user.id)

	await userPage.elementUpdatedVisible()

	await userPage.hasCrudContent(updatedEmail)
	await userPage.hasCrudContent("Changed")
	await userPage.hasCrudContent("Data")
	await userPage.hasCrudContent("disabled")
	await userPage.hasCrudContent("Admin")
})
