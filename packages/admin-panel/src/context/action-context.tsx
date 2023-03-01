import { RaAction } from "../types/RaAction"
import { generateContext } from "../utils/generate-context"

export const [ActionContextProvider, useActionContext] = generateContext<RaAction>("list")
