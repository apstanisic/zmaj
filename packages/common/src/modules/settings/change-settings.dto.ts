import { filterStruct } from "@common/utils/filter-struct"
import { notNil } from "@common/utils/not-nil"
import { ZodDto } from "@common/zod"
import { SetNonNullable } from "type-fest"
import { z } from "zod"
import { Settings } from "./settings.type"

const ChangeSettingsSchema = z
	.object({
		signUpAllowed: z.boolean().nullish(),
		defaultSignUpRole: z.string().uuid().nullish(),
	} satisfies Record<keyof Settings["data"], unknown>)
	.partial()
	.transform((obj): SetNonNullable<typeof obj> => filterStruct(obj, notNil))

export class ChangeSettingsDto extends ZodDto(ChangeSettingsSchema) {}
