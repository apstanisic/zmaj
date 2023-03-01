import { useRecord } from "@admin-panel/hooks/use-record"
import { useInfraState } from "@admin-panel/state/useInfraState"
import { Confirm } from "@admin-panel/ui/Confirm"
import { ResponsiveButton } from "@admin-panel/ui/ResponsiveButton"
import { Tooltip } from "@admin-panel/ui/Tooltip"
import { RelationDef } from "@zmaj-js/common"
import { useNotify, useRefresh } from "ra-core"
import { memo, useCallback, useState } from "react"
import { MdCallMerge } from "react-icons/md"
import { useSdk } from "../../../context/sdk-context"
import { useGetJunctionCollection } from "./useConvertToManyToManyOptions"

export const JoinManyToManyButton = memo(() => {
	const relation = useRecord<RelationDef>()
	const [showConfirm, setShowConfirm] = useState(false)
	const sdk = useSdk()
	const refreshPage = useRefresh()
	const notify = useNotify()
	const junctionCol = useGetJunctionCollection(relation)
	const infra = useInfraState()

	const joinRelation = useCallback(
		async (junctionCollectionName: string) => {
			try {
				await sdk.infra.relations.joinManyToMany(junctionCollectionName)
				await infra.refetch()
				notify("Successfully created M2M relation", { type: "success" })
				refreshPage()
			} catch (error) {
				notify("Problem joining relation", { type: "error" })
			}
		},
		[sdk.infra.relations, infra, notify, refreshPage],
	)

	if (!relation) return <></>
	if (relation.type === "many-to-many") return <></>
	if (junctionCol?.isJunctionTable) return <></>

	if (relation.type === "owner-one-to-one" || relation.type === "ref-one-to-one") {
		return (
			<Tooltip text="O2O can't be converted to M2M. Remove unique from FK column first.">
				<div>
					<ResponsiveButton icon={<MdCallMerge />} label="Join M2M" disabled></ResponsiveButton>
				</div>
			</Tooltip>
		)
	}

	if (!junctionCol) {
		return (
			<Tooltip text="There is no compatible FK">
				<div>
					<ResponsiveButton icon={<MdCallMerge />} label="Join M2M" disabled></ResponsiveButton>
				</div>
			</Tooltip>
		)
	}

	return (
		<>
			<ResponsiveButton
				icon={<MdCallMerge />}
				label="Join M2M"
				onClick={() => setShowConfirm(true)}
			></ResponsiveButton>

			<Confirm
				open={showConfirm}
				title="Join Relation"
				content="Are you sure you want to join relations? This will create composite unique key in database."
				onClose={() => setShowConfirm(false)}
				onConfirm={() => {
					setShowConfirm(false)
					void joinRelation(junctionCol.collectionName)
				}}
			/>
		</>
	)
})
