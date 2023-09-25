import { MyReferenceField } from "@admin-panel/generator/many-to-one/MyReferenceField"
import { useHtmlTitle } from "@admin-panel/hooks/use-html-title"
import { useRecord } from "@admin-panel/hooks/use-record"
import { BlankShowField } from "@admin-panel/shared/show/BlankShowField"
import { ResponsiveButton } from "@admin-panel/ui/ResponsiveButton"
import { FileInfo, IdRecord, isNil, templateParser, User } from "@zmaj-js/common"
import { ReactNode, useMemo } from "react"
import { MdDownload } from "react-icons/md"
import { GeneratedShowPage } from "../../generator/pages/GeneratedShowPage"
import { DisplayZmajFile } from "../../ui/display-file"
import { useDownloadFiles } from "./hooks/use-download-files"

export function FilesShow(): JSX.Element {
	return (
		<GeneratedShowPage startButtons={<CustomActions />}>
			<FileShowContent />
		</GeneratedShowPage>
	)
}

function CustomActions(): JSX.Element {
	const file = useRecord<IdRecord<FileInfo>>()
	const downloadFile = useDownloadFiles(file ? [file] : [])

	return <ResponsiveButton icon={<MdDownload />} label="Download" onClick={downloadFile} />
}

/**
 * We need to keep this is separate function so we can access `RecordContext`
 */
function FileShowContent(): JSX.Element {
	const file = useRecord<IdRecord<FileInfo>>()
	const fileName = useMemo(() => template(file, "{name}"), [file])

	useHtmlTitle("File " + fileName)
	if (!file) return <></>
	return (
		<div className="my-3 mx-auto grid max-w-7xl grid-cols-1 rounded border p-3 shadow-2xl dark:border-zinc-800 lg:grid-cols-2">
			<div className="center dark:bg-neutral-800  flex-1 rounded bg-gray-300">
				<DisplayZmajFile
					file={file}
					className="max-h-[600px] min-h-[300px] min-w-[280px] max-w-[600px]"
				/>
			</div>
			<div className="flex flex-1 flex-col space-y-4">
				<div className="w-full space-y-5  p-3 ">
					<h2 className="border-b pb-2 text-center text-xl">File Info</h2>
					<FileInfoItem label="Name" value={template(file, "{name}")} />
					<FileInfoItem label="Size" value={template(file, "{fileSize|toKb}kb")} />
					<FileInfoItem
						label="User"
						value={
							<MyReferenceField source="userId" reference="zmajUsers">
								<BlankShowField render={(r: User) => r.email} />
							</MyReferenceField>
						}
					/>
					<FileInfoItem label="Storage provider" value={file.storageProvider} />
					<FileInfoItem label="Folder" value={file.folderPath} />
					<FileInfoItem label="Mime Type" value={template(file, "{mimeType}")} />
					<FileInfoItem label="Created At" value={template(file, "{createdAt|date}")} />
					<FileInfoItem label="Description" value={file.description} />
				</div>
			</div>
		</div>
	)
}
/**
 * Wrapper to reduce boilerplate
 */
function template(file: Partial<FileInfo> | undefined, field: string): string {
	return templateParser.parse(field, file)
}

/**
 * Render single file info
 */
function FileInfoItem<T>({ value, label }: { label: string; value: ReactNode }): JSX.Element {
	// Don't return anything if null
	if (isNil(value) || value === "") return <></>

	return (
		<div>
			<span className="font-semibold">{label}: </span>
			<span className="text-base">{value}</span>
		</div>
	)
}
