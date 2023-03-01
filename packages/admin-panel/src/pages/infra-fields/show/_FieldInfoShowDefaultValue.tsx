import { useRecord } from "@admin-panel/hooks/use-record"
import { FieldDef } from "@zmaj-js/common"
import { memo } from "react"
import { fieldComponents } from "../../../field-components/field-components"
import { ManualShowField } from "../../../shared/show/ManualShowField"

export const FieldShowDefaultValue = memo(() => {
	const record = useRecord<FieldDef>()
	if (!record) return <></>
	const Component = fieldComponents.get(record.componentName ?? record.dataType ?? "short-text")

	return <ManualShowField source="dbDefaultValue" Component={Component.Show} />
})
