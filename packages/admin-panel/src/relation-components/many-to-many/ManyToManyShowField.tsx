import { ShowFieldContainer } from "@admin-panel/shared/show/ShowFieldContainer"
import { OneToManyShowRowActions } from "../one-to-many/OneToManyShowRowActions"
import { OneToManyRowsList } from "../one-to-many/shared/OneToManyRowsList"
import { ManyToManyReference, ManyToManyReferenceProps } from "./ManyToManyReference"

type ManyToManyShowFieldProps = ManyToManyReferenceProps & {
	label: string
	className?: string
	template?: string
}

export function ManyToManyShowField(props: ManyToManyShowFieldProps): JSX.Element {
	const { label, className, template, ...rest } = props
	return (
		<ManyToManyReference {...rest}>
			<ShowFieldContainer className={className} label={label}>
				<OneToManyRowsList
					template={template}
					actions={(record) => <OneToManyShowRowActions record={record} />}
				/>
			</ShowFieldContainer>
		</ManyToManyReference>
	)
}
