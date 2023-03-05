import { useInfraState } from "@admin-panel/state/useInfraState"
import { CollectionMetadataCollection, FieldMetadata, RelationMetadata } from "@zmaj-js/common"
import { RaRecord, useNotify, useRedirect } from "ra-core"

export function useOnInfraPropertyDelete(): (data: RaRecord) => Promise<void> {
	const notify = useNotify()
	const redirect = useRedirect()
	const infra = useInfraState()

	return async (data: RaRecord) => {
		await infra.refetch()
		const col = infra.data.find(
			(c) => c.tableName === (data as FieldMetadata | RelationMetadata).tableName,
		)
		notify("ra.notification.deleted", {
			type: "success",
			messageArgs: { smart_count: 1 },
		})
		redirect("show", CollectionMetadataCollection.collectionName, col?.id)
	}
}
