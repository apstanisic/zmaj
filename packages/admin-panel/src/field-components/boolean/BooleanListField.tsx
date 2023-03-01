import { memo } from "react"
import { RenderListField } from "../../shared/list/RenderListField"
import { ListFieldProps } from "../types/ListFieldProps"
import { DisplayBooleanValue } from "./_DisplayBooleanValue"

export const BooleanListField = memo((props: ListFieldProps) => (
	<RenderListField {...props} render={({ value }) => <DisplayBooleanValue value={value} />} />
))
