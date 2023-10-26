import { useRecord } from "@admin-panel/hooks/use-record"
import { ShowFieldContainer } from "@admin-panel/shared/show/ShowFieldContainer"
import { cn } from "@admin-panel/utils/cn"
import { templateParser } from "@zmaj-js/common"
import { useMemo } from "react"
import { ManyToOneLink } from "../many-to-one/ManyToOneLink"
import { ManyToOneReference } from "../many-to-one/ManyToOneReference"

type ManyToOneShowFieldProps = {
	source: string
	reference: string
	label: string
	className?: string
	template?: string
}

export function OwnerOneToOneShowField(props: ManyToOneShowFieldProps): JSX.Element {
	return (
		<ManyToOneReference
			// this is fk field that point to the other table
			// we need to provide this to react-admin, not relation property
			// we are not using our API for getting nested data, but react-admin's data provider
			source={props.source}
			reference={props.reference}
			// label={props.label}
			empty={
				<ShowFieldContainer label={props.label} className={cn(props.className)}>
					<p className="text-warning">-</p>
				</ShowFieldContainer>
			}
		>
			<Renderer label={props.label} template={props.template} className={props.className} />
		</ManyToOneReference>
	)
}

/**
 * This need to be separate component so we can access proper record context
 */
function Renderer(
	props: Pick<ManyToOneShowFieldProps, "label" | "template" | "className">,
): JSX.Element {
	// this is record from relation
	const record = useRecord()

	const content = useMemo(
		() =>
			templateParser.parse(
				props.template ?? "", //
				record,
				{ fallback: record?.id },
			),
		[props.template, record],
	)

	return (
		<ShowFieldContainer label={props.label} className={cn(props.className)}>
			<ManyToOneLink>{content}</ManyToOneLink>
		</ShowFieldContainer>
	)
}
