import { useRecord } from "@admin-panel/hooks/use-record"
import { ResponsiveButton } from "@admin-panel/ui/buttons/ResponsiveButton"
import { RelationDef } from "@zmaj-js/common"
import { useRedirect } from "ra-core"
import { memo } from "react"
import { CgCornerUpRight } from "react-icons/cg"
import { useInfraState } from "../../../state/useInfraState"

export const ShowOtherSideOfRelation = memo(() => {
	const redirect = useRedirect()
	const relation = useRecord<RelationDef>()
	const infra = useInfraState()

	// if there is no rightRelation, it means it's one sided relation (other side is system table)
	const rightRelation = infra.data.find(
		(c) => c.collectionName === relation?.otherSide.collectionName,
	)?.relations[relation?.otherSide.propertyName ?? " _"] //
	// find(
	// 	(r) =>
	// 		r.rightCollectionName === relation.leftCollectionName &&
	// 		r.propertyName === relation.rightPropertyName,
	// )
	if (!rightRelation) return <></>

	return (
		<ResponsiveButton
			label="Other Side"
			onPress={() => redirect("show", "zmaj_relation_metadata", rightRelation.id)}
			icon={<CgCornerUpRight />}
		/>
	)
})
