import { CollectionDef, RelationDef } from "@zmaj-js/common"
import { useGetCollection } from "../../../state/use-get-collection"

/**
 *
 */
export function useGetJunctionCollection(relation?: RelationDef): CollectionDef | undefined {
	const futureJunction =
		relation === undefined
			? undefined
			: relation.type === "many-to-one"
			? relation.collectionName
			: relation.type === "one-to-many"
			? relation.otherSide.collectionName
			: undefined

	const col = useGetCollection(futureJunction ?? "_never")

	if (!col || Object.values(col.relations).length !== 2) return

	if (Object.values(col.relations).filter((r) => r.type === "many-to-one").length !== 2) return
	return col
}
