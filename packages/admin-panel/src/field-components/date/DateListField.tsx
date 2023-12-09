import { RenderListField } from "../../shared/list/RenderListField"
import { ListFieldProps } from "../types/ListFieldProps"
import { extractDate } from "./_date-utils"

/**
 * Date field
 */

export function DateListField(props: ListFieldProps) {
	return (
		<RenderListField
			{...props}
			render={({ value }) => extractDate(value)}
			className="whitespace-normal"
		/>
	)
}
