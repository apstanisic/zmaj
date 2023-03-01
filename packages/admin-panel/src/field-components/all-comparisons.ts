import { comparisons } from "@zmaj-js/common"

export const allComparisons = [...comparisons, "$exists", "$not_exists"] as const
