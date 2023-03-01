import { stateFactory } from "../../../utils/createState"

export const [useSelectedStorage] = stateFactory<string | null>(null)
