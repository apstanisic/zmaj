import { CommonTextConfigSchema } from "@zmaj-js/common"
import { maxLength, minLength, regex, Validator } from "ra-core"
import { useMemo } from "react"
import { z } from "zod"

type Config = z.input<typeof CommonTextConfigSchema> | null

function getStringValidation(config?: Config, validate?: Validator[]): Validator[] {
	const validators = validate ? [...validate] : []
	const parsed = CommonTextConfigSchema.safeParse(config ?? {})

	if (!parsed.success) return validators

	if (parsed.data.minLength) validators.push(minLength(parsed.data.minLength))
	if (parsed.data.maxLength) validators.push(maxLength(parsed.data.maxLength))
	if (parsed.data.regex) validators.push(regex(regex, parsed.data.regexError))

	return validators
}

export const useStringValidation = (config?: Config, validate?: Validator[]): Validator[] => {
	return useMemo(() => getStringValidation(config, validate), [config, validate])
}
