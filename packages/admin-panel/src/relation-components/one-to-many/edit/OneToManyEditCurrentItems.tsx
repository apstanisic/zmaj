import { useRecord } from "@admin-panel/hooks/use-record"
import { OneToManyReference } from "../OneToManyReference"
import { OneToManyRowsList } from "../shared/OneToManyRowsList"
import { OneToManyEditFieldProps } from "./OneToManyEditField"
import { OneToManyEditRowActions } from "./OneToManyEditRowActions"

export function OneToManyEditCurrentItems(
	props: Pick<
		OneToManyEditFieldProps,
		"reference" | "target" | "template" | "source" | "fkNullable"
	>,
) {
	const record = useRecord()
	const { reference, target, template } = props

	const id = record?.id
	if (!id) return <></>

	return (
		<OneToManyReference
			reference={reference}
			filter={{ [target]: id }}
			// we need fk field, not right property: should be comments.postId
			target={target}
			perPage={5}
		>
			<OneToManyRowsList
				className="h-[250px] overflow-auto"
				template={template}
				actions={(record) => (
					<OneToManyEditRowActions
						record={record}
						source={props.source}
						canDelete={props.fkNullable !== false}
					/>
				)}
			/>
		</OneToManyReference>
	)
}
