import { expect } from "@playwright/test"
import { test } from "../../setup/e2e-fixture.js"

test("Delete User", async ({ userPage, userItem, userFx }) => {
	await userPage.goHome()
	await userPage.clickLink("Users")
	await userPage.toHaveUrl("")

	await userPage.goToShow(userItem.id)

	await userPage.clickDeleteButton()
	await userPage.clickConfirmButton()
	await userPage.goToList()

	await userPage.isOnListPage()

	await userPage.elementDeletedVisible()

	const userInDb = await userFx.findWhere({ id: userItem.id })
	expect(userInDb).toBeUndefined()
})
