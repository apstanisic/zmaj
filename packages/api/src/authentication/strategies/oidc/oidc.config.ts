import { AuthenticationConfig } from "@api/authentication/authentication.config"
import { ConfigService } from "@api/config/config.service"
import { Injectable } from "@nestjs/common"
import { Struct, ZodDto } from "@zmaj-js/common"
import { OidcConfigSchema } from "./oidc-config.schema"

/**
 * We are taking oidc config from `AuthenticationConfig`, and join it with config from .env
 * No data is passed manually, and there is no need for `module-definition`
 */
@Injectable()
export class OidcConfig extends ZodDto(OidcConfigSchema) {
	// constructor(params: OidcConfigParams, configService: ConfigService) {
	constructor(authnConfig: AuthenticationConfig, configService: ConfigService) {
		const params = authnConfig.oidc
		const values = configService.getGroups("OIDC_PROVIDERS")
		const envValues: Struct[] = []

		for (const [name, providerConfig] of Object.entries(values)) {
			envValues.push({ name, ...providerConfig })
		}

		/**
		 *
		 */
		// super({ ...params, providers: [...(params.providers ?? []), ...envValues] as any[] })
		// THIS IS DISABLED
		super({ providers: [] })
	}
}
