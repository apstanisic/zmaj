import { FieldDef } from "@zmaj-js/common"
import { generateContext } from "../utils/generate-context"

export const [FieldContextProvider, useFieldContext] = generateContext<FieldDef | undefined>(
	undefined,
)
