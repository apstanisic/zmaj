import { isNil } from "@zmaj-js/common"
import { memo, ReactNode, useMemo } from "react"
import { ShowFieldProps } from "../../field-components/types/ShowFieldProps"
import { ensureValidChild } from "../ensure-valid-child"
import { ShowFieldContainer } from "./ShowFieldContainer"

type RenderShowFieldProps = ShowFieldProps & {
	render?: (props: ShowFieldProps) => ReactNode
	containerActions?: ReactNode
}
/**
 * Component that render data in card
 * null and undefined are different in that user has access to that value when value is null.
 * When value is undefined that means that user can't access that field, or field does not exist
 */

export const RenderShowField = memo((props: RenderShowFieldProps) => {
	const { label, source, render, description, value } = props

	const content = useMemo(() => {
		if (isNil(value)) return null
		if (render) return render(props)
		return ensureValidChild(value)
	}, [props, render, value])

	return (
		<ShowFieldContainer
			label={label ?? source}
			description={description}
			className={props.className}
			actions={props.containerActions}
		>
			{content}
		</ShowFieldContainer>
	)
})
