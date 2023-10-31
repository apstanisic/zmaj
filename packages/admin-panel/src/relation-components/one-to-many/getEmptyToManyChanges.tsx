import { ToManyChange } from "@zmaj-js/common"

export const getEmptyToManyChanges = (): ToManyChange => ({
	type: "toMany",
	added: [],
	removed: [],
})
