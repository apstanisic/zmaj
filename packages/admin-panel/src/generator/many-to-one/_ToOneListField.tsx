import { useRecord } from "@admin-panel/hooks/use-record"
import { templateParser } from "@zmaj-js/common"
import { memo } from "react"
import { RenderListField } from "../../shared/list/RenderListField"
import { MyReferenceField } from "./MyReferenceField"
import { ToOneInternalProps } from "./ToOneInternalProps.type"

export const ToOneListField = memo((props: Omit<ToOneInternalProps, "className">) => {
	const { field, relation } = props

	return (
		<MyReferenceField source={field.fieldName} reference={relation.otherSide.collectionName}>
			<RenderToOneListField label={props.label} template={props.template} />
		</MyReferenceField>
	)
})

/**
 * Needs to be separate component so we can access referenced record context
 */
function RenderToOneListField(props: Pick<ToOneInternalProps, "label" | "template">): JSX.Element {
	const record = useRecord()

	return (
		<RenderListField
			action="list"
			source="id"
			label={props.label}
			value={record?.id}
			record={record}
			render={({ record }) => (
				<div className="max-w-[12rem] truncate">
					{templateParser.parse(props.template, record, { fallback: record?.id })}
				</div>
			)}
		/>
	)
}
