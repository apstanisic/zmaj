import { FormSelectInput, FormTextInput } from "@admin-panel/ui/Controlled"
import { RelationCreateDto } from "@zmaj-js/common"

export function FkOptionsInput(props: Pick<RelationCreateDto, "type">) {
	return (
		<>
			<FormTextInput
				name="fkName"
				label="Foreign Key Name"
				description="Leave empty for default value"
			/>

			{props.type !== "many-to-many" ? (
				<FormSelectInput
					name="onDelete"
					label="On Delete"
					defaultValue=""
					description="Leave empty for default value"
					options={[
						{ value: "SET NULL", label: "Set Null" },
						{ value: "CASCADE", label: "Delete" },
						{ value: "SET DEFAULT", label: "Set Default Value" },
						{ value: "RESTRICT", label: "Prevent" },
						{ value: "NO ACTION", label: "No Action" },
					]}
				/>
			) : (
				<FormTextInput
					name="junction.fkName"
					label="Second Foreign Key Name"
					description="Leave empty for default value"
				/>
			)}
		</>
	)
}
