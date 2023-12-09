// import { set, trim } from "lodash-es"
// import { FolderTreeItem } from "./FolderTreeItem"

// function transformFolders(folders: string[]): Folders {
// 	const pathsTree = { "/": {} }
// 	for (const path of folders) {
// 		set(pathsTree["/"], trim(path, "/").split("/"), path)
// 	}
// 	return pathsTree
// }

// export type Folders = {
// 	[key: string]: string | Folders
// }

// type FoldersTreeProps = {
// 	folders: Folders
// 	base?: string
// }

// export function FoldersTree(props: FoldersTreeProps) {
// 	const { folders, base } = props

// 	return (
// 		<>
// 			{Object.entries(folders).map((folder, i) => {
// 				const section = folder[0]
// 				const value = folder[1]
// 				const currentPath = base + "/" + section

// 				if (typeof value === "string") {
// 					return <FolderTreeItem key={currentPath} nodeId={currentPath} label={section} />
// 				}
// 				return (
// 					<FolderTreeItem key={currentPath} label={section} nodeId={currentPath}>
// 						<FoldersTree folders={value} base={currentPath} />
// 					</FolderTreeItem>
// 				)
// 			})}
// 		</>
// 	)
// }

export default {}
