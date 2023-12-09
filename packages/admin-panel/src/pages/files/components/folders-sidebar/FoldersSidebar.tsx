// import { ChevronRight, ExpandMore } from "react-icons/md"
// import { TreeView } from "@mui/lab"
// import { Collapse } from "@mui/material"
// import { isArray, isNil, omit, set, trim, trimEnd } from "lodash-es"
// import { useCallback, useMemo } from "react"
// import { useListContext } from "ra-core"
// import { useExpandedFolders } from "../../hooks/use-expanded-folders"
// import { useFileFolders } from "../../hooks/use-file-folders"
// import { useShowFoldersSidebar } from "../../hooks/use-show-folders-sidebar"
// import { Folders, FoldersTree } from "./FoldersTree"
// import { FolderTreeItem } from "./FolderTreeItem"

// function transformFolders(folders: string[]): { $root: Folders } {
// 	const pathsTree = { $root: {} }
// 	for (const path of folders) {
// 		// don't add root path
// 		if (path === "/") continue
// 		set(pathsTree.$root, trim(path, "/").split("/"), path)
// 	}
// 	return pathsTree
// }

// /**
//  * @todo Enable this in the future
//  */
// export function FoldersSidebar(props: { folders?: string[] }) {
// 	const [showFolders] = useShowFoldersSidebar()
// 	const [expanded, setExpanded] = useExpandedFolders()
// 	const folders = useFileFolders().data
// 	const list = useListContext()

// 	const parsed = useMemo(() => transformFolders(folders), [folders])

// 	const openFolder = useCallback(
// 		(path: string) => {
// 			if (path === "/") {
// 				return list.setFilters(
// 					// if root folder, simply omit filter
// 					omit(list.filterValues, "folderPath__$like"), //
// 					list.displayedFilters,
// 				)
// 			}

// 			list.setFilters(
// 				{ ...list.filterValues, folderPath__$like: `${path}%`, _and: true },
// 				list.displayedFilters,
// 			)
// 		},
// 		[list],
// 	)

// 	const selected = useMemo(() => {
// 		const value = list.filterValues?.["folderPath__$like"]
// 		if (isNil(value)) return []
// 		// we need to remove % from end that is used for "like" comparison
// 		// and we have to append special '$root' property
// 		return [`$root${trimEnd(value, "%")}`]
// 	}, [list.filterValues])

// 	return (
// 		<Collapse in={showFolders} orientation="horizontal">
// 			<TreeView
// 				defaultCollapseIcon={<ExpandMore />}
// 				defaultExpandIcon={<ChevronRight />}
// 				//   sx={{ flexGrow: 1, width: 250, overflowY: "auto" }}
// 				className="mx-4 mt-8 w-60 grow border-r border-r-slate-100"
// 				expanded={expanded}
// 				selected={selected}
// 				onNodeToggle={(e, ids) => {
// 					if (Array.isArray(ids)) {
// 						setExpanded(ids)
// 					}
// 				}}
// 				onNodeSelect={(event: unknown, nodeIds: string[]) => {
// 					const path = typeof nodeIds === "string" ? nodeIds : nodeIds.join("")
// 					const replacedRoot = path.replace("$root", "")
// 					openFolder(replacedRoot === "" ? "/" : replacedRoot)
// 				}}
// 			>
// 				<FolderTreeItem nodeId="$root" label="/">
// 					<FoldersTree folders={parsed.$root} base="$root" />
// 				</FolderTreeItem>
// 			</TreeView>
// 		</Collapse>
// 	)
// }

export default {}
