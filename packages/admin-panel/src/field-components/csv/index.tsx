import { DefineCrudField } from "../DefineCrudField"
import { CsvInputField } from "./CsvInputField"
import { CsvShowField } from "./CsvShowFieldShow"

export const CsvComponents = DefineCrudField({
	name: "csv",
	Show: CsvShowField,
	Input: CsvInputField,
	// List: CsvListField,
	availableFor: ["text"],
	// FieldConfig: () => <EnumChooser />,
})
