import { useLayoutConfigContext } from "@admin-panel/context/layout-config-context"
import { FieldDef, notNil } from "@zmaj-js/common"
import { useMemo } from "react"
import { useResourceCollection } from "../../../hooks/use-resource-collection"
import { throwInApp } from "../../../shared/throwInApp"

export function useFilterableFields(): FieldDef[] {
	const collection = useResourceCollection() ?? throwInApp("487342")
	const config = useLayoutConfigContext().list

	const filterableFields = useMemo(
		// fields that are specified as filterable will be returned (only if field is valid)
		() =>
			config.filterableFields
				?.map((fieldName) => collection.fields[fieldName])
				.filter(notNil) ??
			// fallback to all fields
			Object.values(collection.fields),
		[collection.fields, config.filterableFields],
	)
	return filterableFields
}
