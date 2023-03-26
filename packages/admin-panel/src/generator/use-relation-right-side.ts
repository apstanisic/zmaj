import { CollectionDef } from "@zmaj-js/common"
import { useRelationContext } from "../context/relation-context"
import { AdminPanelError } from "../shared/AdminPanelError"
import { useGetCollection } from "../state/use-get-collection"

/**
 * Get collection info for other side of the applied relation
 *
 * When we have applied relation, sometimes we need to access additional info from other collection
 * Like we need template for other collection
 * @returns Other collection info
 */
export function useRelationRightSide(): CollectionDef | undefined {
	const relation = useRelationContext()

	if (!relation) throw new AdminPanelError("9643")

	const otherSide = useGetCollection(relation.otherSide.collectionName)

	// if user does not have access, do not throw error
	// if (!otherSide) throw new AdminPanelError("3011")
	return otherSide
}
