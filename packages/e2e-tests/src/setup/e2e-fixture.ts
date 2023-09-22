import { test as base } from "@playwright/test"
import { ZmajSdk } from "@zmaj-js/client-sdk"
import { Orm } from "zmaj"
import { AuthPage } from "../tests/auth/auth.pom.js"
import { FieldPage } from "../tests/db-fields/field.pom.js"
import { FilePage } from "../tests/files/file.pom.js"
import { PermissionPage } from "../tests/permissions/permission.pom.js"
import { RolePage } from "../tests/roles/role.pom.js"
import { UserPage } from "../tests/users/user.pom.js"
import { WebhookPages } from "../tests/webhooks/webhook.pom.js"
import { getSdk } from "../utils/e2e-get-sdk.js"
import { getOrm } from "./e2e-orm.js"

type MyFixtures = {
	orm: Orm
	sdk: ZmajSdk
	webhookPage: WebhookPages
	filePage: FilePage
	userPage: UserPage
	rolePage: RolePage
	fieldPage: FieldPage
	permissionPage: PermissionPage
	authPage: AuthPage
}

export const test = base.extend<MyFixtures>({
	orm: async ({ page }, use) => {
		const orm = await getOrm(true)
		await use(orm)
		await orm.destroy()
	},
	sdk: async ({ page }, use) => {
		await use(getSdk())
	},
	webhookPage: async ({ page, orm }, use) => {
		await use(new WebhookPages(page, orm))
	},
	filePage: async ({ page, orm, sdk }, use) => {
		await use(new FilePage(page, orm, sdk))
	},
	userPage: async ({ page, orm }, use) => {
		await use(new UserPage(page, orm, "/#/zmajUsers"))
	},
	rolePage: async ({ page, orm }, use) => {
		await use(new RolePage(page, orm, "/#/zmajRoles"))
	},
	fieldPage: async ({ page, orm, sdk }, use) => {
		await use(new FieldPage(page, orm, sdk))
	},
	permissionPage: async ({ page, orm }, use) => {
		await use(new PermissionPage(page, orm, "/#/zmajPermissions"))
	},
	authPage: async ({ page, orm }, use) => {
		await use(new AuthPage(page, orm, "/#/"))
	},
})
