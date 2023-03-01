import { RelationCreateDto } from "@zmaj-js/common"
import { DropdownInputField } from "../../../field-components/dropdown/DropdownInputField"
import { shortTextDbColumnValidation } from "../../../shared/db-column-form-validation"
import { ManualInputField } from "../../../shared/input/ManualInputField"

export function FkOptionsInput(props: Pick<RelationCreateDto, "type">): JSX.Element {
	return (
		<>
			<ManualInputField
				source="leftFkName"
				label="Foreign Key Name"
				description="Leave empty for default value"
				fieldConfig={shortTextDbColumnValidation}
			/>

			{props.type !== "many-to-many" ? (
				<ManualInputField
					Component={DropdownInputField}
					source="onDelete"
					label="On Delete"
					defaultValue=""
					description="Leave empty for default value"
					fieldConfig={{
						component: {
							dropdown: {
								choices: [
									{ value: "SET NULL", label: "Set Null" },
									{ value: "CASCADE", label: "Delete" },
									{ value: "SET DEFAULT", label: "Set Default Value" },
									{ value: "RESTRICT", label: "Prevent" },
									{ value: "NO ACTION", label: "No Action" },
								],
							},
						},
					}}
				/>
			) : (
				<ManualInputField
					source="rightFkName"
					label="Second Foreign Key Name"
					description="Leave empty for default value"
					fieldConfig={shortTextDbColumnValidation}
				/>
			)}
		</>
	)
}
