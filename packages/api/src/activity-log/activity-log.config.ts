import { Inject, Injectable } from "@nestjs/common"
import { ZodDto } from "@zmaj-js/common"
import { z } from "zod"
import { MODULE_OPTIONS_TOKEN } from "./activity-log.module-definition"

const Schema = z.object({
	// logCrudEvents: z.boolean().default(false),
	// trackCrudChanges: z.boolean().default(false),
	logLevel: z.enum(["disabled", "events-only", "full"]).default("disabled"),
})

export type ActivityLogConfigParams = z.input<typeof Schema>

@Injectable()
export class ActivityLogConfig extends ZodDto(Schema) {
	constructor(@Inject(MODULE_OPTIONS_TOKEN) params: ActivityLogConfigParams) {
		super(params)
	}
}
