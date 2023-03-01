import { Property } from "../types/Property"
import { generateContext } from "../utils/generate-context"

export const [PropertiesContextProvider, usePropertiesContext] = generateContext<Property[]>([])
