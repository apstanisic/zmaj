import { InfraStateService } from "@api/infra/infra-state/infra-state.service"
import { mockInfraStateService } from "@api/infra/infra-state/infra-state.service.mock"
import { Provider, ValueProvider } from "@nestjs/common"
import { Test, TestingModuleBuilder } from "@nestjs/testing"
import { isFunction } from "radash"
import { mockConfigService, mockGlobalConfig } from "./config.service.mock"
import { mockRepoManagers } from "./repo-manager.mock"

/**
 * There are couple built in providers:
 * - RepoManager
 * - InfraStateService
 *
 * @param provider Main provider (also accepts controller)
 * @param additionalProviders
 * @param type
 */
export function buildTestModule(
	provider: any,
	additionalProviders: Provider[] = [],
	type?: "controller" | "provider",
): TestingModuleBuilder {
	const isController =
		type === "controller" || (isFunction(provider) && provider.name.includes("Controller"))

	const providers: Provider[] = [
		...mockRepoManagers(),
		mockConfigService,
		mockGlobalConfig,
		{ provide: InfraStateService, useFactory: mockInfraStateService },
		...additionalProviders.map((pr) =>
			isFunction(pr) ? ({ provide: pr, useValue: {} } as ValueProvider) : pr,
		),
	]

	if (!isController) {
		providers.push(provider)
	}

	return Test.createTestingModule({
		providers: [...providers],
		controllers: isController ? [provider] : [],
	}).useMocker(() => ({}))
}
