import { GlobalConfig } from "@api/app/global-app.config"
import { ConfigService } from "@api/config/config.service"
import { Provider } from "@nestjs/common"
import { vi } from "vitest"

export const mockConfigService: Provider = {
	provide: ConfigService,
	useFactory: () =>
		({
			get: vi.fn((key: string) => (key === "SECRET_KEY" ? "qwerty_qwerty_qwerty_123" : undefined)),
			getAll: vi.fn(() => ({})),
			getGroups: vi.fn(() => ({})),
		} as Record<keyof ConfigService, any>),
}

export const mockGlobalConfig: Provider = {
	provide: GlobalConfig,
	inject: [ConfigService],
	useFactory: (c: ConfigService) => new GlobalConfig({}, c),
}
