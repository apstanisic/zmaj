import { useRecord } from "@admin-panel/hooks/use-record"
import { templateParser } from "@zmaj-js/common"
import { memo } from "react"
import { RenderListField } from "../../shared/list/RenderListField"
import { MyReferenceOneField } from "../many-to-one/MyReferenceOneField"
import { ToOneInternalProps } from "../many-to-one/ToOneInternalProps.type"
import { RefOneToOneInternalProps } from "./ref-one-to-one-props.type"

/**
 *
 * Not working good. It makes separate request for every row
 *
 */
export const RefOneToOneListField = memo((props: Omit<RefOneToOneInternalProps, "className">) => {
	const { relation } = props

	return (
		<div className="w-full font-bold">
			<MyReferenceOneField
				reference={relation.otherSide.collectionName}
				target={relation.otherSide.fieldName}
				// label={props.label}
				// className="w-full font-bold"
				// emptyText={(<p className="text-red-400">NULL</p>) as any}
				// TODO It now throws when value is react node, so we can't say it to be purple color
				// emptyText="NULL"
				// link="show"
			>
				<RenderToOneListField label={props.label} template={props.template} />
			</MyReferenceOneField>
		</div>
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
