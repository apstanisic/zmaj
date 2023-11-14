import { OneToManyEditField, OneToManyEditFieldProps } from "../one-to-many/edit/OneToManyEditField"
import { OneToManyRowsList } from "../one-to-many/shared/OneToManyRowsList"
import { ManyToManyEditRowActions } from "./ManyToManyEditRowActions"
import { ManyToManyReference } from "./ManyToManyReference"

type ManyToManyEditFieldProps = OneToManyEditFieldProps & {
	trough: string
	troughSource: string
	troughTarget: string
}

export function ManyToManyEditField(props: ManyToManyEditFieldProps) {
	return (
		<OneToManyEditField
			{...props}
			fkNullable
			currentItems={
				<ManyToManyReference {...props}>
					<OneToManyRowsList
						className="h-[330px]"
						template={props.template}
						actions={(record) => (
							<ManyToManyEditRowActions record={record} source={props.source} />
						)}
					/>
				</ManyToManyReference>
			}
		/>
	)
}
