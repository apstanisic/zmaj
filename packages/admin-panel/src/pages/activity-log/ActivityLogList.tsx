import { PropertiesContextProvider } from "@admin-panel/context/property-context"
import { TableLayout } from "@admin-panel/crud-layouts/list/table/TableLayout"
import { GeneratedListPage } from "@admin-panel/generator/pages/GeneratedListPage"
import { Property } from "@admin-panel/types/Property"
import { ActivityLogCollection } from "@zmaj-js/common"
import { memo } from "react"
import { ActivityLogEventIcon } from "./ActivityLogEventIcon"

const listProperties: Property[] = [
	{
		field: ActivityLogCollection.fields["resource"]!,
		type: "field",
		property: "resource",
	},

	{
		field: ActivityLogCollection.fields["action"]!,
		type: "field",
		property: "action",
		Render: ActivityLogEventIcon as any as () => JSX.Element,
	},
	{
		field: ActivityLogCollection.fields["createdAt"]!,
		type: "field",
		property: "createdAt",
	},
]

export const ActivityLogList = memo(() => {
	return (
		<GeneratedListPage>
			<PropertiesContextProvider value={listProperties}>
				<TableLayout />
			</PropertiesContextProvider>
		</GeneratedListPage>
	)
})
