import { RaAction } from "../types/RaAction"
import { generateContext } from "../utils/generate-context"

/**
 * Current RA action
 */
export const [ActionContextProvider, useActionContext] = generateContext<RaAction>("list")
