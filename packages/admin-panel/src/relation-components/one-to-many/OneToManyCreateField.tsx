import { ShowFieldContainer } from "@admin-panel/shared/show/ShowFieldContainer"
import { Tooltip } from "@admin-panel/ui/Tooltip"
import { IconButton } from "@admin-panel/ui/buttons/IconButton"
import { cn } from "@admin-panel/utils/cn"
import { useState } from "react"
import { MdAdd } from "react-icons/md"

type OneToManyCreateFieldProps = {
	target: string
	reference: string
	label: string
	className?: string
	template?: string
	disabled?: boolean
}

export function OneToManyCreateField(props: OneToManyCreateFieldProps) {
	const { disabled, label, template } = props
	const [pickerOpen, setPickerOpen] = useState(false)

	return (
		<ShowFieldContainer
			label={props.label}
			// adds margin so it has spacing like it has helper text
			className={cn("mb-[1.5rem]", props.className)}
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
			<ToManyInputChanges
				template={template}
				ids={changes.value.added}
				// toggleItem={(id) => setChanges(idActions.toggleItem(changes, "added", id))}
				toggleItem={(id) => changes.toggle("added", id)}
			/>
		</ShowFieldContainer>
	)
}
