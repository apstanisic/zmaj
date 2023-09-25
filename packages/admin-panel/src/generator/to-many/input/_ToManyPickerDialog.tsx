import { Dialog } from "@admin-panel/ui/Dialog"
import { IdType } from "@zmaj-js/orm"
import { memo, useCallback } from "react"
import { useToManyInputContext } from "../../../context/to-many-input-context"
import { ChoicesPicker } from "../../../shared/choices/ChoicesPicker"
import { ToManyChoicesContext } from "./_ToManyChoicesContext"

/**
 * Picker that is shown that enables to select item
 */
export const ToManyPickerDialog = memo(() => {
	const { changes, template, pickerOpen, setPickerOpen } = useToManyInputContext()

	const addItem = useCallback((id: IdType) => changes.add("added", [id]), [changes])

	return (
		<Dialog
			open={pickerOpen}
			onClose={() => setPickerOpen(false)}
			// fullWidth
			className="min-h-[400px] max-w-2xl px-3 py-6"
			// classes={{ paper: "px-3 py-6" }}
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
})
