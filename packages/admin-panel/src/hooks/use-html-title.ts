import { ResourceDefinition } from "ra-core"
import { isString } from "radash"
import { useTitle } from "react-use"

export function useHtmlTitle(
	titleOrResource: string | ResourceDefinition,
	action: string = "",
): void {
	const title = isString(titleOrResource)
		? titleOrResource
		: titleOrResource.options.label ?? titleOrResource.name

	useTitle(`${action} ${title} | Admin Panel`.trim(), { restoreOnUnmount: true })
}
