import { faker } from "@faker-js/faker"
import { test as base } from "@playwright/test"
import { ZmajSdk } from "@zmaj-js/client-sdk"
import {
	ADMIN_ROLE_ID,
	CollectionMetadata,
	FieldMetadata,
	FileInfo,
	Permission,
	PermissionCreateDto,
	User,
	UserCreateDto,
	Webhook,
	WebhookCreateDto,
} from "@zmaj-js/common"
import { TPost } from "@zmaj-js/test-utils"
import { Orm, Role } from "zmaj"
import { AuthPage } from "../tests/auth/auth.pom.js"
import { CollectionPageFx, CollectionUtilsFx } from "../tests/db-collections/collection.pom.js"
import { FieldPage, FieldUtilsFx } from "../tests/db-fields/field.pom.js"
import { FilePageFx, FileUtilsFx } from "../tests/files/file.pom.js"
import { PermissionPage, PermissionUtilsFx } from "../tests/permissions/permission.pom.js"
import { PostPageFx, PostUtilsFx } from "../tests/records/post.pom.js"
import { RoleDb, RolePage } from "../tests/roles/role.e2e-utils.js"
import { UserPage, UserUtilsFx } from "../tests/users/user.pom.js"
import { WebhookPages, WebhookUtilsFx } from "../tests/webhooks/webhook.pom.js"
import { getSdk } from "../utils/e2e-get-sdk.js"
import { getOrm } from "./e2e-orm.js"
import { getUniqueEmail, getUniqueTitle } from "./e2e-unique-id.js"

type MyFixtures = {
	orm: Orm
	sdk: ZmajSdk
	//
	webhookPage: WebhookPages
	webhookFx: WebhookUtilsFx
	webhookItem: Webhook
	//
	userPage: UserPage
	userFx: UserUtilsFx
	userItem: User
	//
	fieldPage: FieldPage
	fieldFx: FieldUtilsFx
	fieldItem: FieldMetadata
	//
	permissionPage: PermissionPage
	permissionFx: PermissionUtilsFx
	permissionItem: Permission
	//
	authPage: AuthPage
	//
	filePage: FilePageFx
	fileFx: FileUtilsFx
	fileItem: FileInfo
	//
	rolePage: RolePage
	fxRoleDb: RoleDb
	zRole: Role
	//
	collectionItem: CollectionMetadata
	collectionFx: CollectionUtilsFx
	collectionPage: CollectionPageFx

	//
	postPage: PostPageFx
	postFx: PostUtilsFx
	postItem: TPost
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
	//
	webhookPage: async ({ page }, use) => {
		await use(new WebhookPages(page))
	},

	webhookFx: async ({ orm }, use) => {
		await use(new WebhookUtilsFx(orm))
	},
	webhookItem: async ({ webhookFx }, use) => {
		const createWebhookDto = new WebhookCreateDto({
			url: "http://example.com",
			name: getUniqueTitle(),
			events: ["create.posts", "create.comments", "update.comments", "delete.tags"],
		})

		const wh = await webhookFx.create(createWebhookDto)
		await use(wh)
		await webhookFx.deleteWhere({ id: wh.id })
	},
	//
	postPage: async ({ page }, use) => {
		await use(new PostPageFx(page, "/#/posts"))
	},
	postFx: async ({ orm }, use) => {
		await use(new PostUtilsFx(orm))
	},
	postItem: async ({ postFx }, use) => {
		const post = await postFx.create({})
		await use(post)
		await postFx.removeWhere({ id: post.id })
	},
	//
	filePage: async ({ page, sdk }, use) => {
		await use(new FilePageFx(page, sdk))
	},
	fileFx: async ({ orm, sdk }, use) => {
		await use(new FileUtilsFx(orm, sdk))
	},
	fileItem: async ({ fileFx }, use) => {
		const file = await fileFx.uploadFile(
			"test-image.png", //
			faker.system.commonFileName("png"),
		)
		await use(file)
		// we do not care about file in storage, since fresh docker is always started
		await fileFx.deleteWhere({ id: file.id })
	},
	//
	userPage: async ({ page }, use) => {
		await use(new UserPage(page, "/#/zmajUsers"))
	},
	userFx: async ({ orm }, use) => {
		await use(new UserUtilsFx(orm))
	},
	userItem: async ({ userFx }, use) => {
		const user = await userFx.createOne(
			new UserCreateDto({
				email: getUniqueEmail(),
				confirmedEmail: true,
				roleId: ADMIN_ROLE_ID,
				status: "active",
			}),
		)
		await use(user)
		await userFx.removeWhere({ id: user.id })
	},
	//
	rolePage: async ({ page }, use) => {
		await use(new RolePage(page, "/#/zmajRoles"))
	},
	zRole: async ({ fxRoleDb }, use) => {
		const role = await fxRoleDb.create({
			name: getUniqueTitle(),
			requireMfa: false,
			description: faker.lorem.sentence(15),
		})
		await use(role)
		await fxRoleDb.delete(role)
	},
	fxRoleDb: async ({ orm }, use) => {
		await use(new RoleDb(orm))
	},
	collectionFx: async ({ orm, sdk }, use) => {
		await use(new CollectionUtilsFx(orm, sdk))
	},
	collectionPage: async ({ page }, use) => {
		await use(new CollectionPageFx(page, "/#/zmajCollectionMetadata"))
	},
	collectionItem: async ({ collectionFx }, use) => {
		const col = await collectionFx.createCollection()
		await use(col)
		await collectionFx.deleteCollection(col)
	},
	fieldPage: async ({ page, sdk }, use) => {
		await use(new FieldPage(page, sdk))
	},

	fieldFx: async ({ orm, sdk }, use) => {
		await use(new FieldUtilsFx(orm, sdk))
	},
	fieldItem: async ({ fieldFx, collectionItem }, use) => {
		const field = await fieldFx.createField(collectionItem, {})
		await use(field)
		await fieldFx.deleteField(field)
	},
	//
	permissionPage: async ({ page }, use) => {
		await use(new PermissionPage(page, "/#/zmajPermissions"))
	},
	permissionFx: async ({ orm }, use) => {
		await use(new PermissionUtilsFx(orm))
	},
	permissionItem: async ({ permissionFx, zRole }, use) => {
		const permission = await permissionFx.createPermission(
			new PermissionCreateDto({
				action: "create",
				resource: "collections.posts",
				roleId: zRole.id,
			}),
		)
		await use(permission)
		await permissionFx.removeWhere({ id: permission.id })
	},
	//
	authPage: async ({ page }, use) => {
		await use(new AuthPage(page, "/#/"))
	},
})
