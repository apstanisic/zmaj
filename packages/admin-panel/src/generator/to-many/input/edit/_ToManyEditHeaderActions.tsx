import { IconButton } from "@admin-panel/ui/IconButton"
import { Tooltip } from "@admin-panel/ui/Tooltip"
import { MdAdd, MdRestartAlt } from "react-icons/md"
import { useToManyInputContext } from "../../../../context/to-many-input-context"

export function ToManyEditHeaderActions(): JSX.Element {
	const { disabled, setPickerOpen, changes, label } = useToManyInputContext()

	return (
		<div className="flex">
			{/* Show picker */}
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

			{/* Reset changes */}
			<Tooltip text="Reset">
				<IconButton
					label="Reset changes"
					disabled={disabled}
					onClick={() => {
						const sure = confirm("Are you sure?")
						if (!sure) return
						changes.setValue({ type: "toMany", added: [], removed: [] })
					}}
				>
					<MdRestartAlt />
				</IconButton>
			</Tooltip>
		</div>
	)
}
