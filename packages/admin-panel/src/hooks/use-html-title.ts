import { useResourceCollection } from "@admin-panel/hooks/use-resource-collection"
import { ResourceDefinition } from "ra-core"
import { isString, title } from "radash"
import { useTitle } from "react-use"

/**
 * Change page title
 */
export function useHtmlTitle(
	titleOrResource: string | ResourceDefinition,
	action: string = "",
): void {
	const title = isString(titleOrResource)
		? titleOrResource
		: titleOrResource?.options?.label ?? titleOrResource.name

	useTitle(`${action} ${title} | Admin Panel`.trim(), { restoreOnUnmount: true })
}

export function useSetCrudHtmlTitle(): void {
	const collection = useResourceCollection()

	useTitle(
		`${collection.label ?? title(collection.collectionName)} | Admin Panel`, //
		{ restoreOnUnmount: true },
	)
}
