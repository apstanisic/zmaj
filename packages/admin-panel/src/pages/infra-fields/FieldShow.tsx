import { useOnInfraPropertyDelete } from "@admin-panel/hooks/use-on-infra-property-delete"
import { useRecord } from "@admin-panel/hooks/use-record"
import { useNonSystemCollections } from "@admin-panel/state/infra-state-v2"
import { ResponsiveButton } from "@admin-panel/ui/ResponsiveButton"
import { CollectionMetadataCollection, FieldDef } from "@zmaj-js/common"
import { useRedirect } from "ra-core"
import { memo, useMemo } from "react"
import { MdViewList } from "react-icons/md"
import { TabsLayout } from "../../crud-layouts/ui/tabs/TabsLayout"
import { TabsSection } from "../../crud-layouts/ui/tabs/TabsSection"
import { BooleanShowField } from "../../field-components/boolean/BooleanShowField"
import { DateTimeShowField } from "../../field-components/datetime/DateTimeShowField"
import { fieldComponents } from "../../field-components/field-components"
import { GeneratedShowPage } from "../../generator/pages/GeneratedShowPage"
import { ManualShowField } from "../../shared/show/ManualShowField"
import { FieldShowDefaultValue } from "./show/_FieldInfoShowDefaultValue"

export const FieldShow = memo(() => {
	const onDelete = useOnInfraPropertyDelete()
	return (
		<GeneratedShowPage
			disableDeleteRedirect
			onDelete={onDelete} //
			startButtons={<StartButtons />}
		>
			<Content />
		</GeneratedShowPage>
	)

	//
})

// Display button to show collection page
function StartButtons(): JSX.Element {
	const field = useRecord<FieldDef>()
	const redirect = useRedirect()

	const cols = useNonSystemCollections()
	const col = useMemo(
		() => cols.find((t) => t.tableName === field?.tableName),
		[cols, field?.tableName],
	)

	if (!col) return <></>

	return (
		<ResponsiveButton
			icon={<MdViewList />}
			onClick={() => redirect("show", CollectionMetadataCollection.collectionName, col.id)}
			label="Collection"
		/>
	)
}

const Content = memo(() => {
	const record = useRecord<FieldDef>()

	// Every component provides
	const FieldConfig = fieldComponents.get(
		record?.componentName,
		record?.dataType ?? "short-text",
	).ShowFieldConfig

	const sections = ["Main", "Advanced", "Input Config"]
	return (
		<TabsLayout sections={FieldConfig ? sections : sections.slice(0, 2)}>
			<TabsSection>
				<ManualShowField source="columnName" />
				{/* <MyReferenceField source="tableName" reference=""></MyReferenceField> */}
				<ManualShowField source="tableName" />
				<ManualShowField
					source="dataType"
					label="Field Data Type"
					description="First Value is our data type, second is sql data type"
					render={({ record }) => `${record?.["dataType"]} (${record?.["dbRawDataType"]})`}
				/>
				<ManualShowField source="isNullable" label="Is Nullable" Component={BooleanShowField} />
				<ManualShowField source="sortable" label="Is Sortable" Component={BooleanShowField} />
				<ManualShowField source="label" />
				<ManualShowField source="description" />
				<ManualShowField source="displayTemplate" />
				<FieldShowDefaultValue />
				{/* is it safe to put default value here. Can React always render?
          It should convert to string on the api, but I'm not sure */}
				<ManualShowField
					source="isPrimaryKey"
					label="Is Primary Key"
					Component={BooleanShowField}
				/>
				<ManualShowField source="isUnique" label="Is Unique" Component={BooleanShowField} />
				{/* <ManualShowField source="dbRawDataType" /> */}
			</TabsSection>
			{/* <Tab label="Additional">
        <>
        </>
      </Tab> */}
			<TabsSection>
				<ManualShowField source="id" />
				{/* <ManualShowField source="collectionId" /> */}
				<ManualShowField
					source="hidden"
					Component={BooleanShowField}
					label="Hidden"
					description="Field exists in API but won't show up in UI"
				/>
				<ManualShowField
					source="canCreate"
					Component={BooleanShowField}
					label="Can Value Be Provided"
				/>
				<ManualShowField
					source="canUpdate"
					Component={BooleanShowField}
					label="Can Value Be Updated"
				/>
				<ManualShowField source="createdAt" Component={DateTimeShowField} />
				{/* <ManualShowField source="beforeCreate" label="Hooks before creating field" />
        <ManualShowField source="beforeUpdate" label="Hooks before updating field" /> */}
				{/* <ManualShowField source="fieldConfig" /> */}
				<ManualShowField source="componentName" />
				<ManualShowField source="width" label="Field Width (Out of 12 sections)" />
			</TabsSection>

			{FieldConfig && (
				<TabsSection>
					<FieldConfig />
				</TabsSection>
			)}
		</TabsLayout>
	)
})
