import { memo } from "react"
import { ShowFieldProps } from "../../field-components/types/ShowFieldProps"
import { ensureValidChild } from "../ensure-valid-child"
import { RenderShowField } from "./RenderShowField"

/**
 * Default show field that simply spits out provided value in a card
 * Use this component when you don't want to override rendering or any other,
 * if you want to customize things, use `ShowField`
 */

export const DefaultShowField = memo((props: ShowFieldProps) => {
	return <RenderShowField {...props} render={({ value }) => <>{ensureValidChild(value)}</>} />
})
