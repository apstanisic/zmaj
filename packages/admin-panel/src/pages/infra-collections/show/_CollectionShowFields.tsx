import { SimpleListLayout } from "@admin-panel/crud-layouts/list/SimpleListLayout"
import { useRecord } from "@admin-panel/hooks/use-record"
import { Button } from "@admin-panel/ui/Button"
import { getCrudUrl } from "@admin-panel/utils/get-crud-url"
import { CollectionDef, FieldDef, FieldMetadataCollection } from "@zmaj-js/common"
import { ResourceContextProvider } from "ra-core"
import { memo } from "react"
import { MdOutlineAddCircle } from "react-icons/md"
import { useHref } from "react-router-dom"
import { TabsSection } from "../../../crud-layouts/ui/tabs/TabsSection"
import { MyArrayField } from "./MyArrayField"
import { CollectionShowFieldsIcon } from "./_CollectionShowFieldsIcon"

export const CollectionShowFields = memo(() => {
	const collection = useRecord<CollectionDef>()

	const newFieldHref = useHref({
		pathname: getCrudUrl(FieldMetadataCollection, "create"),
		search: `source=${JSON.stringify({ collectionName: collection?.collectionName })}`,
	})

	if (!collection) return <></>

	return (
		<TabsSection>
			<MyArrayField source="fields">
				<ResourceContextProvider value={FieldMetadataCollection.collectionName}>
					<SimpleListLayout<FieldDef>
						// linkType="show"
						primaryText={(field) => field.fieldName}
						secondaryText={(field) => field.componentName ?? field.dataType}
						endIcon={(field) => <CollectionShowFieldsIcon collection={collection} field={field} />}
						rowClassName="border-b"
						// rowStyle={(r) => ({ borderBottom: "1px solid #ccc" })}
					/>
				</ResourceContextProvider>
			</MyArrayField>
			<Button
				endIcon={<MdOutlineAddCircle />}
				href={newFieldHref}
				className="mx-auto w-72"
				variant="transparent"
			>
				Add field
			</Button>
		</TabsSection>
	)
})
