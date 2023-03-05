import { useRecord } from "@admin-panel/hooks/use-record"
import { isNil, templateParser } from "@zmaj-js/common"
import { clsx } from "clsx"
import { memo } from "react"
import { ManualShowField } from "../../shared/show/ManualShowField"
import { RenderShowField } from "../../shared/show/RenderShowField"
import { MyReferenceField } from "./MyReferenceField"
import { ToOneInternalProps } from "./ToOneInternalProps.type"

export const ToOneShowField = memo((props: ToOneInternalProps) => {
	const { field, mainRecord, relation } = props

	const noValue = isNil(mainRecord?.[field.fieldName])
	if (noValue) {
		return (
			<ManualShowField
				source={relation.fieldName}
				label={props.label}
				className={clsx("text-base", props.className)}
			/>
		)
	}

	return (
		<MyReferenceField
			// this is fk field that point to the other table
			// we need to provide this to react-admin, not relation property
			// we are not using our API for getting nested data, but react-admin's data provider
			source={field.fieldName}
			reference={relation.otherSide.collectionName}
			// label={props.label}
			className={clsx("w-full font-bold", props.className)}
			// link="show"
		>
			<RenderField label={props.label} template={props.template} />
		</MyReferenceField>
	)
})

/**
 * This need to be separate component so we can access proper record context
 */
function RenderField(props: Pick<ToOneInternalProps, "label" | "template">): JSX.Element {
	// this is record from relation
	const record = useRecord()

	return (
		<RenderShowField
			action="show"
			source="id"
			label={props.label}
			value={record?.id}
			className="w-full"
			record={record}
			render={({ record }) =>
				templateParser.parse(
					props.template ?? "", //
					record,
					{ fallback: record?.id },
				)
			}
		/>
	)
}
