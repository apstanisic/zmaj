import { Tooltip } from "@admin-panel/ui/Tooltip"
import { IconButton } from "@admin-panel/ui/buttons/IconButton"
import { MdAdd, MdRestartAlt } from "react-icons/md"
import { useToManyInputContext } from "../../../../context/to-many-input-context"

export function ToManyEditHeaderActions() {
	const { disabled, setPickerOpen, changes, label } = useToManyInputContext()

	return (
		<div className="flex">
			{/* Show picker */}
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

			{/* Reset changes */}
			<Tooltip text="Reset">
				<IconButton
					aria-label="Reset changes"
					isDisabled={disabled}
					onPress={() => {
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
