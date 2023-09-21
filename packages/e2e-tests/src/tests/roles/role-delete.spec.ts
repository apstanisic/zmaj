import { Role, RoleCreateDto } from "@zmaj-js/common"
import { test } from "../../setup/e2e-fixture.js"
import { getUniqueTitle } from "../../setup/e2e-unique-id.js"

let role: Role

test.beforeEach(async ({ rolePage }) => {
	role = await rolePage.db.create(new RoleCreateDto({ name: getUniqueTitle(), requireMfa: false }))
})
test.afterEach(async ({ rolePage }) => rolePage.db.deleteByName(role.name))

test("Delete Role", async ({ page, rolePage }) => {
	await rolePage.goHome()
	await rolePage.goToList()
	await rolePage.goToShow(role.id)
	await rolePage.clickDeleteButton()
	await rolePage.clickConfirmButton()
	await rolePage.isOnListPage()
	await rolePage.elementDeletedVisible()
})
