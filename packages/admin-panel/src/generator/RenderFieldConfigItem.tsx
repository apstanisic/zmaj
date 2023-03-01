import { v4 } from "uuid"
// import { generateLocalField } from "../collection-info-builder"
import { FieldContextProvider } from "../context/field-context"
import { GeneratedField } from "./properties/GeneratedField"

/**
 * @deprecated
 * This used to create FieldMetadata based on minimal info
 */
function generateLocalField(params: any): any {
	return {}
}
/**
 *
 * @param props @deprecated
 * @returns
 */
export function RenderFieldConfigItem(
	props: Partial<Parameters<typeof generateLocalField>[0]> & { fieldName: string },
): JSX.Element {
	return (
		<FieldContextProvider
			value={generateLocalField({
				tableName: "zmaj_special",
				collectionId: v4(),
				dataType: "short-text",
				...props,
			})}
		>
			<GeneratedField />
		</FieldContextProvider>
	)
}
