import { test } from "../../setup/e2e-fixture.js"

test.beforeEach(async ({ userFx, userItem }) => {
	await userFx.repo.updateById({
		id: userItem.id,
		changes: {
			confirmedEmail: true,
			status: "active",
			firstName: "Test",
			lastName: "Smith",
		},
	})
})

test("Show User", async ({ userPage, userItem }) => {
	await userPage.goHome()
	await userPage.goToList()
	await userPage.goToShow(userItem.id)

	await userPage.hasCrudContent(userItem.email)
	await userPage.hasCrudContent(userItem.firstName)
	await userPage.hasCrudContent(userItem.lastName)
	await userPage.hasCrudContent(userItem.status)
})
