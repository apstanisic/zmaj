import { Inject, Injectable } from "@nestjs/common"
import { ZodDto, snakeCase } from "@zmaj-js/common"
import { z } from "zod"
import { MODULE_OPTIONS_TOKEN } from "./infra.module-definition"
import { camel } from "radash"

const InfraSchema = z.object({
	/**
	 * This will not change existing case. Only in the future if user does not specify value.
	 * Or when current database schema is synced
	 */
	defaultCase: z.enum(["none", "snake", "camel"]).default("none"),
})

export type InfraConfigParams = z.input<typeof InfraSchema>

@Injectable()
export class InfraConfig extends ZodDto(InfraSchema) {
	constructor(@Inject(MODULE_OPTIONS_TOKEN) params: InfraConfigParams) {
		super(params)
	}

	/**
	 * Convert collection, field or relation to it's case
	 * This is used when user didn't provide name manually, or when syncing with existing db
	 */
	toCase(val: string): string {
		if (this.defaultCase === "snake") return snakeCase(val)
		if (this.defaultCase === "camel") return camel(val)
		return val
	}
}
