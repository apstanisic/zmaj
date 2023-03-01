import { stateFactory } from "../../../utils/createState"

/**
 * Value and setter for showing files sidebar. It does not use zustand state, it stores data
 * in persistent storage
 *
 * @returns Array where first value is should sidebar be shown, and second is setter
 */
export const [useShowFoldersSidebar] = stateFactory(false)
