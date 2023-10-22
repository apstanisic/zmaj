import { useListLayoutConfig } from "@admin-panel/context/layout-config-context"
import { clsx } from "clsx"
import { RaRecord, useListContext } from "ra-core"
import { memo } from "react"
import { DefineCrudLayout } from "../../DefineCrudLayout"
import { GalleryLayoutItem } from "./_GalleryLayoutItem"

const smallSizeCss = `
       grid-cols-2
    sm:grid-cols-3
    md:grid-cols-3
    lg:grid-cols-5
    xl:grid-cols-6
   2xl:grid-cols-8
  `

const normalSizeCss = `
       grid-cols-1
    sm:grid-cols-2
    md:grid-cols-2
    lg:grid-cols-3
    xl:grid-cols-4
   2xl:grid-cols-5
  `

/**
 * @todo only works for zmaj files for now
 */
const GalleryLayout = memo(() => {
	const { data } = useListContext()

	// const config = collection.views?.list ?? {}
	// TODO Return config options
	const config = useListLayoutConfig()

	const size = config.size

	return (
		<div className="flex min-h-[300px]">
			{data?.length === 0 && <div className="mt-16 w-full text-center text-lg">No items</div>}
			<div
				style={{ height: "fit-content" }}
				className={clsx(
					"my-4 grid flex-1 gap-x-5 gap-y-6 ",
					size === "small" ? smallSizeCss : normalSizeCss,
				)}
			>
				{data?.map((record: RaRecord, i) => <GalleryLayoutItem record={record} key={i} />)}
			</div>
		</div>
	)
})

export const ListGalleryLayout = DefineCrudLayout({
	type: "list",
	name: "gallery",
	Layout: GalleryLayout,
})
