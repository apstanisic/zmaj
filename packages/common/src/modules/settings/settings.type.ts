import { z } from "zod"
import { RuntimeSettingsSchema } from "./runtime-settings.schema"

export type Settings = {
	data: z.infer<typeof RuntimeSettingsSchema>
	meta: {
		signUpDynamic: boolean
	}
	// signUp: {
	// 	isDynamic: boolean
	// 	allowed: boolean
	// }
}
