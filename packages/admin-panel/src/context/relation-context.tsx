import { RelationDef } from "@zmaj-js/common"
import { generateContext } from "../utils/generate-context"

export const [RelationContextProvider, useRelationContext] = generateContext<
	RelationDef | undefined
>(undefined)
