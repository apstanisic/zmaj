import { BootstrapOrm } from "@api/database/BootstrapOrm"
import { FactoryProvider } from "@nestjs/common"
import { CollectionDef, Struct, snakeCase } from "@zmaj-js/common"
import { BaseModel, Class, Orm, RepoManager } from "@zmaj-js/orm"
import { vi } from "vitest"

export const mockRepoManagers = (): [FactoryProvider, FactoryProvider, FactoryProvider] => {
	// those two share same repos, only diff is that base is available before db connection.
	// base should only be used on system tables
	const repos: Struct = {}
	const factory = (): any => ({
		// return skeleton, you should to mock other things
		getRepo: vi.fn((col: CollectionDef | Class<BaseModel>) => {
			const table =
				typeof col === "function" ? snakeCase(new col().getTableName()) : col.tableName
			const testId = `REPO_${table}`
			repos[testId] ??= { testId }
			return repos[testId]
		}),
		transaction: (params: { fn: (em: any) => any }) => {
			return params.fn("TEST_TRX")
		},
	})
	return [
		{ provide: RepoManager, useFactory: factory },
		{ provide: Orm, useFactory: factory },
		{ provide: BootstrapOrm, useFactory: factory },
	]
}
