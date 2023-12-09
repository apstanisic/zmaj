import { cn } from "@admin-panel/utils/cn"
import { EmptyManyToOneShowField } from "../shared/EmptyManyToOneShowField"
import { ManyToOneReference } from "./ManyToOneReference"
import { ManyToOneShowFieldRender } from "./ManyToOneShowFieldRender"

export type ManyToOneShowFieldProps = {
	source: string
	reference: string
	label: string
	className?: string
	template?: string
	description?: string
}

export function ManyToOneShowField(props: ManyToOneShowFieldProps) {
	return (
		<ManyToOneReference
			// this is fk field that point to the other table
			// we need to provide this to react-admin, not relation property
			// we are not using our API for getting nested data, but react-admin's data provider
			source={props.source}
			reference={props.reference}
			// label={props.label}
			empty={<EmptyManyToOneShowField label={props.label} className={cn(props.className)} />}
		>
			<ManyToOneShowFieldRender
				description={props.description}
				label={props.label}
				template={props.template}
				className={props.className}
			/>
		</ManyToOneReference>
	)
}
