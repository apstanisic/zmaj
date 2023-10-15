import { CheckboxInput } from "@admin-panel/ui/forms/Checkbox"
import { IdType } from "@zmaj-js/orm"
import { clsx } from "clsx"
import { useListContext } from "ra-core"
import { memo } from "react"

export const GalleryItemCheckbox = memo(({ id }: { id: IdType }) => {
	const { onToggleItem, selectedIds } = useListContext()
	return (
		<CheckboxInput
			aria-label="Select file"
			size="large"
			isSelected={selectedIds.includes(id)}
			onChange={(check) => onToggleItem(id)}
			// checked={selectedIds.includes(id)}
			// onChange={() => onToggleItem(id)}
			// // Prevents image bellow to react to click
			// onClick={(e) => e.stopPropagation()}
			// reduce opacity if only viewing files, only when some selected it's fully opaque
			className={clsx(
				"absolute top-2 left-2",
				selectedIds.length === 0 ? "opacity-50" : "opacity-75",
			)}
		/>
	)
})
