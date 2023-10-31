import { ShowFieldContainer } from "@admin-panel/shared/show/ShowFieldContainer"
import { Tooltip } from "@admin-panel/ui/Tooltip"
import { IconButton } from "@admin-panel/ui/buttons/IconButton"
import { cn } from "@admin-panel/utils/cn"
import { IdType } from "@zmaj-js/orm"
import { ChoicesContextProvider } from "ra-core"
import { get, toggle } from "radash"
import { useCallback, useState } from "react"
import { useFormContext } from "react-hook-form"
import { MdAdd } from "react-icons/md"
import { ReferencesPickerDialog } from "../shared/ReferencePickerDialog"
import { OneToManyReference } from "./OneToManyReference"
import { getEmptyToManyChanges } from "./getEmptyToManyChanges"
import { OneToManyAddedItems } from "./shared/OneToManyChangedItems"
import { useOneToManyCreateChoices } from "./shared/useOneToManyCreateChoices"

type OneToManyCreateFieldProps = {
	source: string
	reference: string
	target: string
	label: string
	className?: string
	template?: string
	disabled?: boolean
}

export function OneToManyCreateField(props: OneToManyCreateFieldProps): JSX.Element {
	const { disabled = false, label, template, source, reference, target } = props
	const [pickerOpen, setPickerOpen] = useState(false)
	// const { field } = useController({ name: source, defaultValue: getEmpty(), disabled })
	const { setValue, watch } = useFormContext()
	const value = watch(source, getEmptyToManyChanges())

	const choices = useOneToManyCreateChoices({
		reference,
		source,
		target,
		enabled: !disabled,
		selected: get(value, "added", []),
	})

	const toggleId = useCallback(
		(id: IdType) => {
			const newValue = { ...value, added: toggle(value.added, id) }
			setValue(source, newValue, { shouldDirty: true, shouldTouch: true })
		},
		[setValue, source, value],
	)

	return (
		<OneToManyReference reference={reference} target={target} source={source}>
			<ChoicesContextProvider value={choices}>
				<ShowFieldContainer
					label={props.label}
					// adds margin so it has spacing like it has helper text
					className={cn("my-3", props.className)}
					actions={
						<Tooltip text="Add">
							<IconButton
								aria-label={`Add ${label}`}
								className="ml-auto"
								isDisabled={disabled}
								onPress={() => setPickerOpen(true)}
							>
								<MdAdd />
							</IconButton>
						</Tooltip>
					}
				>
					<ReferencesPickerDialog
						selected={choices.selectedChoices}
						show={pickerOpen}
						setShow={setPickerOpen}
						multiple
						onSelect={toggleId}
						template={template}
					/>
					<OneToManyAddedItems
						template={template}
						added={value.added}
						reference={reference}
						onRevert={toggleId}
					/>
				</ShowFieldContainer>
			</ChoicesContextProvider>
		</OneToManyReference>
	)
}
