import { AppModule } from "@api/app/app.module"
import { AppService } from "@api/app/app.service"
import { ConfigureAppParams } from "@api/app/configure-app-params.type"
import { BootstrapRepoManager } from "@api/database/BootstrapRepoManager"
import { OnInfraChangeService } from "@api/infra/on-infra-change.service"
import { UsersService } from "@api/users/users.service"
import { INestApplication } from "@nestjs/common"
import { NestExpressApplication } from "@nestjs/platform-express"
import { Test } from "@nestjs/testing"
import { ADMIN_ROLE_ID, CollectionMetadataModel, User, UserCreateDto, merge } from "@zmaj-js/common"
import { BaseModel, OrmRepository, RepoManager } from "@zmaj-js/orm"
import { SequelizeService } from "@zmaj-js/orm-sq"
import { Class } from "type-fest"
import { v4 } from "uuid"
import { predefinedApiConfigs } from "../predefined-configs-const"
import { TestingUtilsModule } from "./testing-utils.module"

export async function getE2ETestModule(
	override: Partial<ConfigureAppParams> = {},
): Promise<INestApplication> {
	const combined: ConfigureAppParams = merge(predefinedApiConfigs.test, override ?? {})
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
export async function getE2ETestModuleExpanded(
	override: Partial<ConfigureAppParams> = {},
): Promise<{
	app: INestApplication
	server: () => any
	createUser: () => Promise<User>
	deleteUser: (user: User) => Promise<void>
	syncInfra: () => Promise<void>
	repo: <T extends BaseModel = BaseModel>(table: string | Class<T>) => OrmRepository<T>
	dropTableAndSync: (tableName: string) => Promise<void>
	dropTable: (tableName: string) => Promise<void>
	changeInfra: (fn: () => Promise<void>) => Promise<void>
}> {
	const app = await getE2ETestModule(override)
	const usersService = app.get(UsersService)

	async function createUser(): Promise<User> {
		return usersService.createUser({
			data: new UserCreateDto({
				firstName: "Test",
				email: `user_${v4()}@example.com`,
				confirmedEmail: true,
				roleId: ADMIN_ROLE_ID,
				status: "active",
				password: "password",
				lastName: "User",
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
		const colRepo = app.get(BootstrapRepoManager).getRepo(CollectionMetadataModel)

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
		repo,
		dropTableAndSync,
		dropTable,
		changeInfra,
	}
}
