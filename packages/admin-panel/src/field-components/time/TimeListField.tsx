import { RenderListField } from "../../shared/list/RenderListField"
import { ListFieldProps } from "../types/ListFieldProps"
import { extractTime } from "./_time-utils"

/**
 * Date field
 */

export function TimeListField(props: ListFieldProps): JSX.Element {
	return (
		<RenderListField
			{...props}
			className="whitespace-normal"
			render={({ value }) => extractTime(value)}
		/>
	)
}
