import { Inject, Injectable } from "@nestjs/common"
import { ZodDto } from "@zmaj-js/common"
import { z } from "zod"
import { MODULE_OPTIONS_TOKEN } from "./authorization.module-definition"
import { AuthzConditionTransformer } from "./db-authorization/condition-transformers/condition-transformer.type"

const Schema = z.object({
	/**
	 * Should we expose what actions are allowed to user. It is recommended for admin panel
	 * This provides FE with
	 */
	exposeAllowedPermissions: z.boolean().default(false),
	/**
	 * Disable authorization
	 */
	disable: z.boolean().default(false),
	/**
	 * @deprecated Should I allow this? It's useful for custom transformers,
	 * but I think there must be better way
	 */
	customConditionTransformers: z.array(z.custom<AuthzConditionTransformer>()).default([]),
})

export type AuthorizationParams = z.input<typeof Schema>

@Injectable()
export class AuthorizationConfig extends ZodDto(Schema) {
	constructor(@Inject(MODULE_OPTIONS_TOKEN) config: AuthorizationParams) {
		super(config)
	}
}
