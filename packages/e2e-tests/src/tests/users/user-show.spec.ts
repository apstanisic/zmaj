import { User, UserCreateDto } from "@zmaj-js/common"
import { test } from "../../setup/e2e-fixture.js"
import { getUniqueEmail } from "../../setup/e2e-unique-id.js"

let user: User

test.beforeEach(async ({ userPage }) => {
	const email = getUniqueEmail()

	await userPage.db.removeByEmail(email)

	user = await userPage.db.createOne(
		new UserCreateDto({
			email,
			confirmedEmail: true,
			status: "active",
			firstName: "Test",
			lastName: "Smith",
		}),
	)
})

test.afterEach(async ({ userPage }) => userPage.db.removeByEmail(user.email))

test("Show User", async ({ page, userPage }) => {
	await userPage.goHome()
	await userPage.goToList()
	await userPage.goToShow(user.id)

	await userPage.hasCrudContent(user.email)
	await userPage.hasCrudContent(user.firstName)
	await userPage.hasCrudContent(user.lastName)
	await userPage.hasCrudContent(user.status)
})
