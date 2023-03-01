import { CollectionDef } from "@zmaj-js/common"
import { useRelationContext } from "../context/relation-context"
import { AdminPanelError } from "../shared/AdminPanelError"
import { useGetCollection } from "../state/use-get-collection"

export function useGetJunction(): CollectionDef | undefined {
	const relation = useRelationContext()

	if (!relation) throw new AdminPanelError("9643")

	const junction = useGetCollection(
		relation.type === "many-to-many" ? relation.junction.collectionName : "_",
	)

	// if user does not have access, do not throw error
	// if (!otherSide) throw new AdminPanelError("3011")
	return junction
}
