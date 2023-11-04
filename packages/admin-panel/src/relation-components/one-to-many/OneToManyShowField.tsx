import { ShowFieldContainer } from "@admin-panel/shared/show/ShowFieldContainer"
import { OneToManyReference } from "./OneToManyReference"
import { OneToManyShowRowActions } from "./OneToManyShowRowActions"
import { OneToManyRowsList } from "./shared/OneToManyRowsList"

export type OneToManyShowFieldProps = {
	target: string
	reference: string
	label: string
	className?: string
	template?: string
}

export function OneToManyShowField(props: OneToManyShowFieldProps): JSX.Element {
	const { label, reference, target, className, template } = props

	return (
		<ShowFieldContainer className={className} label={label}>
			<OneToManyReference
				reference={reference}
				// we need fk field, not right property: should be comments.postId
				target={target}
				perPage={10}
			>
				<OneToManyRowsList
					template={template}
					actions={(record) => <OneToManyShowRowActions record={record} />}
				/>
			</OneToManyReference>
		</ShowFieldContainer>
	)
}
