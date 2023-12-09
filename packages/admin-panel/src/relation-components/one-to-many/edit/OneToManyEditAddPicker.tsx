import { useRecord } from "@admin-panel/hooks/use-record"
import { ChoicesPicker } from "@admin-panel/shared/choices/ChoicesPicker"
import { Dialog } from "@admin-panel/ui/Dialog"
import { ToManyChange } from "@zmaj-js/common"
import { IdType } from "@zmaj-js/orm"
import { ChoicesContextProvider, ResourceContextProvider } from "ra-core"
import { useCallback } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import { getEmptyToManyChanges } from "../getEmptyToManyChanges"
import { toManyChangeUtils } from "../shared/toManyChangeUtils"
import { useOneToManyCreateChoices } from "../shared/useOneToManyCreateChoices"

type OneToManyEditAddPickerProps = {
	source: string
	reference: string
	target: string
	disabled?: boolean
	open: boolean
	setOpen: (val: boolean) => void
	template?: string
}

export function OneToManyEditAddPicker(props: OneToManyEditAddPickerProps) {
	const { source, reference, target, disabled, open, setOpen, template } = props
	const { setValue } = useFormContext()
	const value = useWatch({
		name: source,
		defaultValue: getEmptyToManyChanges(),
		disabled,
	}) as ToManyChange
	const mainRecord = useRecord()

	const choices = useOneToManyCreateChoices({
		enabled: open,
		source,
		selected: value.added,
		reference,
		target,
		filter: {
			// only where fk is null or does not belong to current record
			$or: [{ [target]: { $eq: null } }, { [target]: { $ne: mainRecord?.id } }],
		},
	})

	const addItem = useCallback(
		(id: IdType) => {
			const newValue = toManyChangeUtils.add(value, "added", id)
			setValue(source, newValue)
		},
		[setValue, source, value],
	)

	return (
		<Dialog
			open={open}
			onClose={() => setOpen(false)}
			className="min-h-[400px] max-w-2xl px-3 py-6"
		>
			<p className="pl-2 pb-4 text-lg">Add items</p>
			<ResourceContextProvider value={reference}>
				<ChoicesContextProvider value={choices}>
					<ChoicesPicker
						template={template}
						isSelected={(r) => value.added.includes(r.id)}
						onClick={(r) => {
							setOpen(false)
							addItem(r.id)
						}}
					/>
				</ChoicesContextProvider>
			</ResourceContextProvider>
		</Dialog>
	)
}
