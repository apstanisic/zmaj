import { stateFactory } from "../../utils/createState"

/**
 * Is dialog for adding filter shown
 */
export const [useShowFilterDialog] = stateFactory<boolean>(false)
