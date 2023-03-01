import { merge } from "@zmaj-js/common"
import { ConfigureAppParams } from "./app/configure-app-params.type"

const defaultUserConfig: ConfigureAppParams = {
	authentication: {
		allowBasicAuth: false,
		allowJwtInQuery: true,
		allowOAuthSignUp: true,
		passwordReset: "reset-email",
		requireEmailConfirmation: true,
		exposePublicInfo: true,
		allowAdminInitialize: true,
		allowSignUp: "dynamic",
		encryptPasswordHash: true,
	},
	authorization: { exposeAllowedPermissions: true },
	// cache: { enabled: true, ttlMs: 3000 },
	config: {
		throwOnNoEnvFile: false,
		useEnvFile: true,
		useProcessEnv: true,
		assignToProcessEnv: true,
		envPath: ".env",
	},
	crud: { allowedJoin: "toOne", relationChange: "toManyFks" },
	database: { logging: false },
	files: { generateCommonImageSizes: true },
	global: { log: true, enableAdminPanelIntegration: true }, // todo add api and app url to cors
	migrations: { autoRunMigrations: false },
	security: { exposeErrorDetails: false },
	storage: { enableFallbackStorage: true },
	activityLog: { logLevel: "full" },
}

const devConfig: ConfigureAppParams = merge(defaultUserConfig, {
	authentication: { allowBasicAuth: true, allowSignUp: "dynamic" },
	migrations: { runDynamicMigrations: false, autoRunMigrations: true },
	security: { exposeErrorDetails: true },
	// cache: { enabled: false },
	database: { logging: false },
	config: { envPath: ".env.dev", throwOnNoEnvFile: true },
} as ConfigureAppParams)

const testConfig: ConfigureAppParams = merge(devConfig, {
	config: { envPath: ".env.test", throwOnNoEnvFile: true },
	global: { log: ["warn", "error"] },
	database: { logging: false },
	migrations: { autoRunMigrations: false },
	security: { exposeErrorDetails: true },
	authentication: { allowBasicAuth: true },
} as ConfigureAppParams)

export const predefinedApiConfigs = {
	dev: devConfig,
	adminPanel: defaultUserConfig,
	test: testConfig,
}
