import { InfraStateService } from "@api/infra/infra-state/infra-state.service"
import { mockInfraStateService } from "@api/infra/infra-state/infra-state.service.mock"
import { InfraConfig } from "@api/infra/infra.config"
import { Provider } from "@nestjs/common"
import { Test, TestingModuleBuilder } from "@nestjs/testing"
import { Class } from "type-fest"
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
	provider: Class<unknown>,
	additionalProviders: Provider[] = [],
): TestingModuleBuilder {
	const isController = provider.name.endsWith("Controller")

	const providers: Provider[] = [
		...mockRepoManagers(),
		mockConfigService,
		mockGlobalConfig,
		{ provide: InfraConfig, useFactory: () => new InfraConfig({ defaultCase: "none" }) },
		{ provide: InfraStateService, useFactory: mockInfraStateService },
		...additionalProviders,
	]

	if (!isController) {
		providers.push(provider)
	}

	return Test.createTestingModule({
		providers: [...providers],
		controllers: isController ? [provider] : [],
	}).useMocker(() => ({}))
}
