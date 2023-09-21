import { expect } from "@playwright/test"
import { User, UserCreateDto } from "@zmaj-js/common"
import { test } from "../../setup/e2e-fixture.js"

let user: User

test.beforeEach(async ({ userPage }) => {
	user = await userPage.db.createOne(
		new UserCreateDto({
			email: userPage.randEmail(),
			confirmedEmail: true,
			status: "active",
			firstName: "Test",
			lastName: "Smith",
		}),
	)
})

test.afterEach(async ({ userPage }) => userPage.db.removeByEmail(user.email))

test("Delete User", async ({ userPage }) => {
	await userPage.goHome()
	await userPage.clickLink("Users")
	await userPage.toHaveUrl("")

	await userPage.goToShow(user.id)

	await userPage.clickDeleteButton()
	await userPage.clickConfirmButton()
	await userPage.goToList()

	await userPage.isOnListPage()

	await userPage.elementDeletedVisible()

	const userInDb = await userPage.db.findByEmail(user.email)
	expect(userInDb).toBeUndefined()
})
