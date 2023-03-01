import { useEffect } from "react"
import { DefineCrudField } from "../field-components/DefineCrudField"
import { AddFieldComponentParams, fieldComponents } from "../field-components/field-components"

/**
 * This hook is used to register components
 */
export function useRegisterFieldComponents(components: AddFieldComponentParams[] = []): void {
	useEffect(() => {
		for (const comp of components) {
			fieldComponents.add(DefineCrudField(comp))
		}
	}, [components])
}
