import { AppModule } from "@api/app/app.module"
import { AppService } from "@api/app/app.service"
import { ConfigureAppParams } from "@api/app/configure-app-params.type"
import { OnInfraChangeService } from "@api/infra/on-infra-change.service"
import { UsersService } from "@api/users/users.service"
import { INestApplication } from "@nestjs/common"
import { NestExpressApplication } from "@nestjs/platform-express"
import { Test } from "@nestjs/testing"
import {
	ADMIN_ROLE_ID,
	CollectionMetadataModel,
	User,
	UserCreateDto,
	UserModel,
	merge,
} from "@zmaj-js/common"
import { BaseModel, Orm, OrmRepository, RepoManager } from "@zmaj-js/orm"
import { SequelizeService } from "@zmaj-js/orm-sq"
import { join } from "node:path"
import { Class } from "type-fest"
import { v4 } from "uuid"
import { predefinedApiConfigs } from "../predefined-configs-const"
import { TestingUtilsModule } from "./testing-utils.module"

export async function getE2ETestModule(
	override: Partial<ConfigureAppParams> = {},
): Promise<INestApplication> {
	const envPath = join(__dirname, "../../../..", ".env.test")
	const combined: ConfigureAppParams = merge(predefinedApiConfigs.test, override ?? {})
	combined.config ??= {}
	combined.config.envPath = envPath
	const module = await Test.createTestingModule({
		imports: [AppModule.register(combined), TestingUtilsModule],
	}).compile()
	const app = module.createNestApplication()
	app.enableShutdownHooks()
	app.get(AppService).configureApp(app as NestExpressApplication)
	await app.init()

	return app
}

export type TestBundle = Awaited<ReturnType<typeof getE2ETestModuleExpanded>>
export async function getE2ETestModuleExpanded(override: Partial<ConfigureAppParams> = {}) {
	const app = await getE2ETestModule(override)
	const usersService = app.get(UsersService)

	async function createUser(data: Partial<UserCreateDto> = {}): Promise<User> {
		return usersService.createUser({
			data: new UserCreateDto({
				firstName: "Test",
				email: `user_${v4()}@example.com`,
				confirmedEmail: true,
				roleId: ADMIN_ROLE_ID,
				status: "active",
				password: "password",
				lastName: "User",
				...data,
			}),
		})
	}

	async function deleteUser(user: User): Promise<void> {
		await usersService.repo.deleteById({ id: user.id })
	}

	const repo = <T extends BaseModel = BaseModel>(table: string | Class<T>): OrmRepository<T> =>
		app.get(RepoManager).getRepo(table)

	const server = (): any => app.getHttpServer()

	const changeInfra = async (fn: () => Promise<void>): Promise<void> => {
		await app
			.get(OnInfraChangeService)
			.executeChange(fn)
			.catch((e) => {
				console.log("Problem changing infra", { e })
			})
	}

	const syncInfra = async (): Promise<void> => {
		await app
			.get(OnInfraChangeService)
			.syncAppAndDb()
			.catch((e) => {
				console.log("Problem syncing infra", { e })
			})
	}

	const dropTable = async (tableName: string): Promise<void> => {
		const qi = app.get(SequelizeService).orm.getQueryInterface()
		const colRepo = app.get(Orm).getRepo(CollectionMetadataModel)

		await qi.dropTable(tableName, { cascade: true })
		await colRepo.deleteWhere({ where: { tableName } })
	}

	const dropTableAndSync = async (tableName: string): Promise<void> => {
		await changeInfra(async () => dropTable(tableName))
	}

	return {
		app,
		server,
		createUser,
		deleteUser,
		syncInfra,
		getRepo: repo,
		dropTableAndSync,
		dropTable,
		changeInfra,
		orm: app.get(Orm),
	}
}

export type TestSdk = {
	app: INestApplication
	destroy: () => Promise<void>
	//
	orm: Orm
	getRepo: <T extends BaseModel = BaseModel>(table: string | Class<T>) => OrmRepository<T>
	getService: <T>(service: Class<T>) => T
	createUser: (data?: Partial<UserCreateDto>) => Promise<User>
	// server: () => any
	// createUser: (data?: Partial<UserCreateDto>) => Promise<User>
	// deleteUser: (user: User) => Promise<void>
	// syncInfra: () => Promise<void>
	// dropTableAndSync: (tableName: string) => Promise<void>
	// dropTable: (tableName: string) => Promise<void>
	// changeInfra: (fn: () => Promise<void>) => Promise<void>
}

export async function createTestServer(
	override: Partial<ConfigureAppParams> = {},
): Promise<TestSdk> {
	async function startServer(): Promise<INestApplication> {
		const envPath = join(__dirname, "../../../..", ".env.test")
		const combined: ConfigureAppParams = merge(predefinedApiConfigs.test, override ?? {})
		combined.config ??= {}
		combined.config.envPath = envPath
		const module = await Test.createTestingModule({
			imports: [AppModule.register(combined), TestingUtilsModule],
		}).compile()
		const app = module.createNestApplication()
		app.enableShutdownHooks()
		app.get(AppService).configureApp(app as NestExpressApplication)
		await app.init()
		return app
	}
	const app = await startServer()

	function getRepo<T extends BaseModel = BaseModel>(table: string | Class<T>): OrmRepository<T> {
		return app.get(RepoManager).getRepo(table)
	}
	const users: User[] = []

	async function createUser(data: Partial<UserCreateDto> = {}): Promise<User> {
		const user = await app.get(UsersService).createUser({
			data: new UserCreateDto({
				firstName: "Test",
				email: `user_${v4()}@example.com`,
				confirmedEmail: true,
				roleId: ADMIN_ROLE_ID,
				status: "active",
				password: "password",
				lastName: "User",
				...data,
			}),
		})
		users.push(user)
		return user
	}

	async function destroy(): Promise<void> {
		if (users.length > 0) {
			await getRepo(UserModel).deleteWhere({ where: { id: { $in: users.map((u) => u.id) } } })
		}
		await app.close()
	}

	return {
		app,
		destroy,
		getRepo,
		orm: app.get(Orm),
		getService: (service) => app.get(service),
		createUser,
	}
}
