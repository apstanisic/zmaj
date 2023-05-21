import { Checkbox } from "@admin-panel/ui/Checkbox"
import { IdType } from "@zmaj-js/orm-common"
import { clsx } from "clsx"
import { useListContext } from "ra-core"
import { memo } from "react"

export const GalleryItemCheckbox = memo(({ id }: { id: IdType }) => {
	const { onToggleItem, selectedIds } = useListContext()
	return (
		<Checkbox
			aria-label="Select file"
			large
			isSelected={selectedIds.includes(id)}
			onChange={(check) => onToggleItem(id)}
			// checked={selectedIds.includes(id)}
			// onChange={() => onToggleItem(id)}
			// // Prevents image bellow to react to click
			// onClick={(e) => e.stopPropagation()}
			// reduce opacity if only viewing files, only when some selected it's fully opaque
			className={clsx(" absolute top-0 left-0", selectedIds.length === 0 && "opacity-50")}
		/>
	)
})
