import { test as base } from "@playwright/test"
import { ZmajSdk } from "@zmaj-js/client-sdk"
import { Orm } from "zmaj"
import { FilePage } from "../tests/files/file.pom.js"
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
	filePage: async ({ page, orm }, use) => {
		await use(new FilePage(page, orm))
	},
	userPage: async ({ page, orm }, use) => {
		await use(new UserPage(page, orm, "/#/zmajUsers"))
	},
	rolePage: async ({ page, orm }, use) => {
		await use(new RolePage(page, orm, "/#/zmajRoles"))
	},
})
