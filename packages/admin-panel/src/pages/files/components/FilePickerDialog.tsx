import { ListPagination } from "@admin-panel/app-layout/list/ListPagination"
import { Dialog } from "@admin-panel/ui/Dialog"
import { FileInfo, IdRecord } from "@zmaj-js/common"
import { ListContextProvider, useListContext, useListController } from "ra-core"
import { TabsLayout } from "../../../crud-layouts/ui/tabs/TabsLayout"
import { TabsSection } from "../../../crud-layouts/ui/tabs/TabsSection"
import { DisplayZmajFile } from "../../../ui/display-file"
import { FileUploadDropzone } from "./FileUploadDropzone"

type FilePickerProps = {
	/**
	 * Callback function that runs when user picks a file
	 */
	onPick: (file: IdRecord<FileInfo>[]) => void
	/**
	 * Is dialog shown
	 */
	open: boolean
	/**
	 * Function to close dialog.
	 */
	onClose: () => void
}

/**
 * Render dialog that shows file that user can pic
 */
export function FilePickerDialog({ onPick, open, onClose }: FilePickerProps) {
	const controller = useListController<IdRecord<FileInfo>>({
		resource: "zmajFiles",
		filter: { mimeType: { $like: "image/%" } },
		queryOptions: { enabled: open },
	})

	return (
		<Dialog open={open} onClose={onClose} className="max-w-screen-xl flex-1">
			<div className=" flex h-[70vh] flex-col justify-start">
				<TabsLayout sections={["From library", "Upload New"]}>
					<TabsSection className="h-full flex-1 flex-grow">
						<ListContextProvider value={controller}>
							<div className="flex flex-col justify-between p-5">
								<Content onClick={(r) => onPick([r])} />
								<ListPagination />
							</div>
						</ListContextProvider>
					</TabsSection>

					<TabsSection>
						<div className="mx-auto max-w-2xl">
							<FileUploadDropzone
								maxFiles={1}
								afterUpload={(files) => onPick(files)}
								className="h-full w-full"
							/>
						</div>
					</TabsSection>
				</TabsLayout>
			</div>
		</Dialog>
	)
}

const Content = (props: { onClick: (record: IdRecord<FileInfo>) => unknown }): JSX.Element => {
	const list = useListContext<FileInfo>()

	return (
		<div className="grid grid-cols-5 gap-4 p-5">
			{list.data?.map((record, i) => (
				<div key={i} role="button" onClick={() => props.onClick(record)}>
					<DisplayZmajFile
						file={record}
						className="aspect-[4/3] min-h-full w-full min-w-full rounded-lg border  bg-cover object-cover shadow-md"
						size="thumbnail"
					/>
				</div>
			))}
		</div>
	)
}
