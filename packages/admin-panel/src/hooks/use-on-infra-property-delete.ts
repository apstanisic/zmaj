import { useInfraState } from "@admin-panel/state/useInfraState"
import { CollectionMetadataCollection, FieldMetadata, RelationMetadata } from "@zmaj-js/common"
import { RaRecord, useNotify, useRedirect } from "ra-core"
import { useCallback } from "react"

/**
 * Call this function when field or relation is deleted.
 * It will refresh infra state, add success notification and redirect to collection page
 */
export function useOnInfraPropertyDelete(): (data: RaRecord) => Promise<void> {
	const notify = useNotify()
	const redirect = useRedirect()
	const infra = useInfraState()

	return useCallback(
		async (data: RaRecord) => {
			await infra.refetch()
			const col = infra.data.find(
				(c) => c.tableName === (data as FieldMetadata | RelationMetadata).tableName,
			)
			notify("ra.notification.deleted", {
				type: "success",
				messageArgs: { smart_count: 1 },
			})
			redirect("show", CollectionMetadataCollection.collectionName, col?.id)
		},
		[infra, notify, redirect],
	)
}
