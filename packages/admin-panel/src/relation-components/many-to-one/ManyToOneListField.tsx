import { useRecord } from "@admin-panel/hooks/use-record"
import { ManyToOneReference } from "@admin-panel/relation-components/many-to-one/ManyToOneReference"
import { cn } from "@admin-panel/utils/cn"
import { templateParser } from "@zmaj-js/common"
import { memo } from "react"
import { ManyToOneLink } from "./ManyToOneLink"

type ManyToOneListFieldProps = {
	source: string
	reference: string
	label: string
	className?: string
	template?: string
}

export const ManyToOneListField = memo((props: ManyToOneListFieldProps) => {
	const { label, reference, source, className, template } = props

	return (
		<ManyToOneReference
			source={source}
			reference={reference}
			empty={<p className={cn("text-purple-600 dark:text-purple-400", className)}>-</p>}
		>
			<Renderer label={label} template={template} className={className} />
		</ManyToOneReference>
	)
})

/**
 * Needs to be separate component so we can access referenced record context
 */
function Renderer(props: Pick<ManyToOneListFieldProps, "label" | "template" | "className">) {
	const record = useRecord()

	const content = templateParser.parse(props.template ?? "", record, { fallback: record?.id })
	return (
		<div className={cn("max-w-[12rem] truncate", props.className)}>
			<ManyToOneLink>{content}</ManyToOneLink>
		</div>
	)
}
