import { BootstrapRepoManager } from "@api/database/orm-specs/BootstrapRepoManager"
import { RepoManager } from "@api/database/orm-specs/RepoManager"
import { FactoryProvider } from "@nestjs/common"
import { CollectionDef, Struct } from "@zmaj-js/common"
import { vi } from "vitest"

export const mockRepoManagers = (): [FactoryProvider, FactoryProvider] => {
	// those two share same repos, only diff is that base is available before db connection.
	// base should only be used on system tables
	const repos: Struct = {}
	const factory = (): any => ({
		// return skeleton, you should to mock other things
		getRepo: vi.fn((col: CollectionDef) => {
			const testId = `REPO_${col.tableName}`
			repos[testId] ??= {
				testId: `REPO_${col.tableName}`,
			}
			return repos[testId]
		}),
		transaction: (params: { fn: (em: any) => any }) => {
			return params.fn("TEST_TRX")
		},
	})
	return [
		{ provide: BootstrapRepoManager, useFactory: factory },
		{ provide: RepoManager, useFactory: factory },
	]
}
