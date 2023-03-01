import { notNil } from "@zmaj-js/common"
import { clsx } from "clsx"
import { isString } from "radash"
import { memo, ReactNode } from "react"
import { ShowFieldProps } from "../../field-components/types/ShowFieldProps"
import { ShowFieldContainer } from "./ShowFieldContainer"

type RenderShowFieldProps = ShowFieldProps & {
	render: (props: ShowFieldProps) => ReactNode
	containerActions?: ReactNode
}
/**
 * Component that render data in card
 * null and undefined are different in that user has access to that value when value is null.
 * When value is undefined that means that user can't access that field, or field does not exist
 */

export const RenderShowField = memo((props: RenderShowFieldProps) => {
	const { label, source, render, description, record, value } = props
	let nilText = value === null ? "NULL" : value === undefined ? "UNKNOWN" : undefined

	if (nilText && notNil(props.customNilText)) {
		nilText = props.customNilText
	}

	return (
		<ShowFieldContainer
			label={label ?? source}
			description={description}
			className={clsx(props.className)}
			actions={props.containerActions}
		>
			{/* &#8203; ensures that field is always full height */}
			{/* Add flex to div so space does not go to second row */}
			{isString(nilText) ? <p className="no-show-value">{nilText}</p> : <>{render(props)}</>}
		</ShowFieldContainer>
	)
})
