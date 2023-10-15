import { SimpleListLayout } from "@admin-panel/crud-layouts/list/SimpleListLayout"
import { useRecord } from "@admin-panel/hooks/use-record"
import { Button } from "@admin-panel/ui/buttons/Button"
import { getCrudUrl } from "@admin-panel/utils/get-crud-url"
import { CollectionDef, RelationDef, RelationMetadataCollection } from "@zmaj-js/common"
import { ResourceContextProvider } from "ra-core"
import { isEmpty } from "radash"
import { memo } from "react"
import { MdOutlineAddCircle } from "react-icons/md"
import { useHref } from "react-router-dom"
import { TabsSection } from "../../../crud-layouts/ui/tabs/TabsSection"
import { MyArrayField } from "./MyArrayField"

export const CollectionShowRelations = memo(() => {
	const collection = useRecord<CollectionDef>()

	const newRelationHref = useHref({
		pathname: getCrudUrl(RelationMetadataCollection, "create"),
		search: `disable_leftCollection=true&source=${JSON.stringify({
			leftCollection: collection?.collectionName,
		})}`,
	})

	return (
		<TabsSection>
			{isEmpty(collection?.relations) ? (
				<div className="my-6 text-center text-lg">No existing relations</div>
			) : (
				<MyArrayField source="relations">
					<ResourceContextProvider value={RelationMetadataCollection.collectionName}>
						<SimpleListLayout<RelationDef>
							// linkType="show"
							primaryText={(relation) =>
								`${relation.tableName}.${relation.propertyName} ⟶ ${relation.otherSide.tableName}`
							}
							secondaryText={(relation) => relation.type}
							rowClassName="border-b"
							// rowStyle={(r) => ({ borderBottom: "1px solid #eee" })}
						/>
					</ResourceContextProvider>
				</MyArrayField>
			)}
			{/* <Button endIcon={<AddCircleOutline />} className="mx-auto w-72" href={newRelationHref}> */}
			<Button
				className="mx-auto w-72"
				endIcon={<MdOutlineAddCircle />}
				color="transparent"
				href={newRelationHref}
			>
				<span>Add relation</span>
			</Button>
		</TabsSection>
	)
})
