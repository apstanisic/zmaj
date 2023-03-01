import { IconButton } from "@admin-panel/ui/IconButton"
import { Tooltip } from "@admin-panel/ui/Tooltip"
import { clsx } from "clsx"
import { memo, useMemo } from "react"
import { MdAdd } from "react-icons/md"
import { useToManyInputContext } from "../../../../context/to-many-input-context"
import { getFieldWidthCss } from "../../../../crud-layouts/get-field-width-css"
import { ShowFieldContainer } from "../../../../shared/show/ShowFieldContainer"
import { ToManyInputChanges } from "../_ToManyInputChanges"

export const ToManyCreateInputField = memo(() => {
	const { disabled, label, template, changes, setPickerOpen } = useToManyInputContext()

	const css = useMemo(() => getFieldWidthCss(12), [])

	return (
		<ShowFieldContainer
			label={label}
			// adds margin so it has spacing like it has helper text
			className={clsx(css, "mb-[1.5rem]")}
			actions={
				<Tooltip text="Add">
					<IconButton
						label={`Add ${label}`}
						className="ml-auto"
						disabled={disabled}
						onClick={() => setPickerOpen(true)}
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
})
