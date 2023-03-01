import { useRecord } from "@admin-panel/hooks/use-record"
import { useInfraState } from "@admin-panel/state/useInfraState"
import { Confirm } from "@admin-panel/ui/Confirm"
import { ResponsiveButton } from "@admin-panel/ui/ResponsiveButton"
import { JunctionRelation } from "@zmaj-js/common"
import { useNotify, useRefresh } from "ra-core"
import { memo, useCallback, useState } from "react"
import { MdCallSplit } from "react-icons/md"
import { useSdk } from "../../../context/sdk-context"

export const SplitRelationButton = memo(() => {
	const relation = useRecord<JunctionRelation>()
	const [show, setShow] = useState(false)
	const sdk = useSdk()
	const refreshPage = useRefresh()
	const notify = useNotify()
	const infra = useInfraState()

	const splitRelation = useCallback(async () => {
		setShow(false)
		try {
			if (!relation) return notify("There is no relation", { type: "error" })
			await sdk.infra.relations.splitManyToMany(relation.junction.collectionName)
			await infra.refetch()

			notify("Successfully splitted relation", { type: "success" })
			refreshPage()
		} catch (error) {
			notify("Problem detaching relation", { type: "error" })
		}
	}, [relation, notify, sdk.infra.relations, infra, refreshPage])

	if (!relation || relation.type !== "many-to-many") return <></>

	return (
		<>
			<Confirm
				open={show}
				title="Detach Relation"
				content="Are you sure you want to convert from many-to-many to 2 many-to-one?"
				onClose={() => setShow(false)}
				onConfirm={() => void splitRelation()}
			/>
			<ResponsiveButton label="Split M2M" onClick={() => setShow(true)} icon={<MdCallSplit />} />
		</>
	)
})
