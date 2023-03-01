import { useLayoutConfigContext } from "@admin-panel/context/layout-config-context"
import { RaRecord } from "ra-core"
import { memo } from "react"
import { useCollectionContext } from "../../../context/collection-context"
import { templateParser } from "@zmaj-js/common"

export const GalleryLayoutItemInfo = memo(({ record }: { record: RaRecord }) => {
	const collection = useCollectionContext()
	const config = useLayoutConfigContext().list

	return (
		<div className="absolute bottom-0 w-full bg-black bg-opacity-70 px-2 py-1 text-white">
			<div className="relative grid h-full w-full grid-cols-2">
				{/* record.name */}
				<span className="col-span-2 mb-1 truncate">
					{templateParser.parse(
						config.primaryTemplate ?? collection.displayTemplate ?? "{id}",
						record,
					)}
				</span>
				{config.size !== "small" && (
					<>
						<div className="text-sm ">
							{templateParser.parse(config.secondaryTemplate ?? "", record)}
						</div>
						<div className="ml-auto text-sm">
							{templateParser.parse(config.tertiaryTemplate ?? "", record)}
						</div>
					</>
				)}
			</div>
		</div>
	)
})
