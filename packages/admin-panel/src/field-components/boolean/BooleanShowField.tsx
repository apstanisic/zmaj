import { memo } from "react"
import { RenderShowField } from "../../shared/show/RenderShowField"
import { ShowFieldProps } from "../types/ShowFieldProps"
import { DisplayBooleanValue } from "./_DisplayBooleanValue"

/**
 * Same as show field, only shows boolean as icon
 */
export const BooleanShowField = memo((props: ShowFieldProps) => (
	<RenderShowField {...props} render={({ value }) => <DisplayBooleanValue value={value} />} />
))
