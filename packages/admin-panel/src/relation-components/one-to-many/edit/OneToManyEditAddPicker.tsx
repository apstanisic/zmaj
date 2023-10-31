import { ChoicesPicker } from "@admin-panel/shared/choices/ChoicesPicker"
import { Dialog } from "@admin-panel/ui/Dialog"
import { IdType } from "@zmaj-js/orm"
import { useCallback } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import { getEmptyToManyChanges } from "../getEmptyToManyChanges"
import { toManyChangeUtils } from "../shared/toManyChangeUtils"

export function OneToManyEditAddPicker(props: { source: string; disabled?: boolean }) {
	const { source, disabled } = props
	const { setValue } = useFormContext()
	const value = useWatch({ name: source, defaultValue: getEmptyToManyChanges(), disabled })

	// useOneToManyCreateChoices({})

	const addItem = useCallback(
		(id: IdType) => {
			const newValue = toManyChangeUtils.add(value, "added", id)
			setValue(source, newValue)
		},
		[setValue, source, value],
	)

	return (
		<Dialog
			open={pickerOpen}
			onClose={() => setPickerOpen(false)}
			className="min-h-[400px] max-w-2xl px-3 py-6"
		>
			<p className="pl-3 text-lg">Add items</p>
			<ToManyChoicesContext>
				<ChoicesPicker
					template={template}
					isSelected={(r) => changes.value.added.some((item) => item === r.id)}
					onClick={(r) => {
						setPickerOpen(false)
						addItem(r.id)
					}}
				/>
			</ToManyChoicesContext>
		</Dialog>
	)
}
