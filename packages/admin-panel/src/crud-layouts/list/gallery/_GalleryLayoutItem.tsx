import { useLayoutConfigContext } from "@admin-panel/context/layout-config-context"
import { RaRecord, useListContext, useRedirect, useResourceContext } from "ra-core"
import { memo } from "react"
import { DisplayZmajFile } from "../../../ui/display-file"
import { GalleryItemCheckbox } from "./_GalleryItemCheckbox"
import { GalleryLayoutItemInfo } from "./_GalleryLayoutItemInfo"

export const GalleryLayoutItem = memo(({ record }: { record: RaRecord }) => {
	const { selectedIds, onToggleItem } = useListContext()
	const id = record.id
	const redirect = useRedirect()
	const config = useLayoutConfigContext().list
	const resourceName = useResourceContext()

	return (
		<div
			className="relative aspect-[4/3] w-full cursor-pointer overflow-hidden rounded-lg border-2 border-gray-400 border-opacity-50 dark:border-gray-700"
			key={id}
			// this was supposed to be normal link if there is no checkbox selected,
			// but act as checkbox button if there are some already selected.
			// I don't know if this is bad for a11y
			// role={selectedIds.length > 0 ? "button" : "link"}
			role="button"
			onClick={() => {
				// If react-admin is in select mode, whole div will be used as a select area
				if (selectedIds.length > 0) {
					onToggleItem(id)
				} else {
					redirect("show", `/${resourceName}`, id)
				}
			}}
		>
			{/* Show checkbox if selected prop is provided */}

			{config.disableMultiSelect !== true && <GalleryItemCheckbox id={id} />}
			<DisplayZmajFile
				file={record as any}
				className="aspect-[4/3] min-h-full w-full min-w-full bg-cover  object-cover shadow-md"
				size="thumbnail"
			/>
			<GalleryLayoutItemInfo record={record} />
		</div>
	)
})
