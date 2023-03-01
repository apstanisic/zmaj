import { CreateButton } from "@admin-panel/app-layout/buttons/CreateButton"
import { SimpleListLayout } from "@admin-panel/crud-layouts/list/SimpleListLayout"
import { Card } from "@admin-panel/ui/Card"
import { Tooltip } from "@admin-panel/ui/Tooltip"
import { CollectionDef } from "@zmaj-js/common"
import { useListContext } from "ra-core"
import { memo } from "react"
import { BsIntersect } from "react-icons/bs"
import { MdViewList } from "react-icons/md"
import { GeneratedListPage } from "../../generator/pages/GeneratedListPage"

export const CollectionList = memo(() => {
	return (
		<GeneratedListPage
			// we are using custom toolbar
			hideToolbar
			title={
				<div className="mt-4 mb-6 flex w-full justify-between">
					<h1 className="text-2xl">All Collections</h1>
					<CreateButton />
				</div>
			}
			queryOptions={{
				select: (result) => ({
					...result,
					// remove system collections
					data: result.data.filter((col: CollectionDef) => !col.tableName.startsWith("zmaj")),
				}),
			}}
		>
			<Card>
				<Empty />
				<SimpleListLayout<CollectionDef>
					primaryText={(col) => col.tableName}
					// secondaryText={(col) => col.description}
					// linkType="show"
					startIcon={(col) => <MdViewList />}
					endIcon={(col) => {
						if (!col.isJunctionTable) return
						return (
							<Tooltip text="This is junction table">
								<BsIntersect />
							</Tooltip>
						)
					}}
				/>
			</Card>
		</GeneratedListPage>
	)
})

function Empty(): JSX.Element {
	const list = useListContext()
	if (list.data?.length === 0) {
		return <div className="mb-8 mt-10 w-full text-center text-xl">No collections</div>
	}
	return <></>
}
