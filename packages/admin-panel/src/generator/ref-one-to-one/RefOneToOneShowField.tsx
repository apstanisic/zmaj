import { useRecord } from "@admin-panel/hooks/use-record"
import { ShowFieldContainer } from "@admin-panel/shared/show/ShowFieldContainer"
import { templateParser } from "@zmaj-js/common"
import { clsx } from "clsx"
import { memo } from "react"
import { RenderShowField } from "../../shared/show/RenderShowField"
import { MyReferenceOneField } from "../many-to-one/MyReferenceOneField"
import { ToOneInternalProps } from "../many-to-one/ToOneInternalProps.type"
import { RefOneToOneInternalProps } from "./ref-one-to-one-props.type"

export const RefOneToOneShowField = memo((props: RefOneToOneInternalProps) => {
	const { relation, className } = props

	return (
		<div className={clsx("w-full", className)}>
			<MyReferenceOneField
				reference={relation.otherSide.collectionName}
				target={relation.otherSide.fieldName}
				// empty={<div>Im empty</div>}
				empty={
					<ShowFieldContainer label={props.label} className="text-warning">
						NULL
					</ShowFieldContainer>
				}
				// label={props.label}
				// className={clsx("w-full font-bold", className)}
				// link="show"
			>
				<RenderField label={props.label} template={props.template} />
			</MyReferenceOneField>
		</div>
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
