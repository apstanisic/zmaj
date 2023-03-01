import { memo } from "react"
import { RenderListField } from "../../shared/list/RenderListField"
import { ListFieldProps } from "../types/ListFieldProps"

/**
 * Number field
 */

export const NumberListField = memo((props: ListFieldProps) => {
	return (
		<RenderListField
			{...props}
			render={(props) => <div className="w-full text-right">{props.value}</div>}
		/>
	)
})
