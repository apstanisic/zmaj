import { useRecord } from "@admin-panel/hooks/use-record"
import { ShowFieldContainer } from "@admin-panel/shared/show/ShowFieldContainer"
import { cn } from "@admin-panel/utils/cn"
import { templateParser } from "@zmaj-js/common"
import { useMemo } from "react"
import { ManyToOneLink } from "./ManyToOneLink"

type ManyToOneShowFieldRendererProps = {
	template?: string
	label: string
	description?: string
	className?: string
	newTab?: boolean
}

/**
 * This need to be separate component so we can access proper record context
 */

export function ManyToOneShowFieldRender(props: ManyToOneShowFieldRendererProps): JSX.Element {
	// this is record from relation
	const record = useRecord()

	const content = useMemo(
		() => templateParser.parse(props.template ?? "", record, { fallback: record?.id }),
		[props.template, record],
	)

	return (
		<ShowFieldContainer
			description={props.description}
			label={props.label}
			className={cn(props.className)}
		>
			<ManyToOneLink newTab={props.newTab}>{content}</ManyToOneLink>
		</ShowFieldContainer>
	)
}
