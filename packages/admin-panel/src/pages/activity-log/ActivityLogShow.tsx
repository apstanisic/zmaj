import { useRecord } from "@admin-panel/hooks/use-record"
import { clsx } from "clsx"
import { ShowBase } from "ra-core"
import { memo } from "react"
import { ActionContextProvider } from "../../context/action-context"
import { TabsLayout } from "../../crud-layouts/ui/tabs/TabsLayout"
import { TabsSection } from "../../crud-layouts/ui/tabs/TabsSection"
import { DateTimeShowField } from "../../field-components/datetime/DateTimeShowField"
import { JsonShowField } from "../../field-components/json/JsonShowField"
import { ToOneShowField } from "../../generator/many-to-one/_ToOneShowField"
import { useResourceCollection } from "../../hooks/use-resource-collection"
import { ManualShowField } from "../../shared/show/ManualShowField"
import { ActivityLogChanges } from "./ActivityLogChanges"
import { ActivityLogEventIcon } from "./ActivityLogEventIcon"

export const ActivityLogShow = memo(() => {
	return (
		<ActionContextProvider value="show">
			<ShowBase>
				<Content />
			</ShowBase>
		</ActionContextProvider>
	)

	//
})

const Content = memo(() => {
	const record = useRecord()
	const col = useResourceCollection()
	return (
		<TabsLayout sections={["Main", "Changes", "Advanced"]}>
			<TabsSection>
				<div className={clsx("grid gap-y-4")}>
					<ManualShowField
						source="action"
						render={(props) => <ActivityLogEventIcon action={props.value} />}
					/>
					<ManualShowField source="resource" />
					<ManualShowField source="createdAt" Component={DateTimeShowField} />
					<ManualShowField source="itemId" />
					<ManualShowField source="createdAt" Component={DateTimeShowField} />
					<ToOneShowField
						mainRecord={record}
						template="{email}"
						label="User"
						field={col.fields["userId"]!}
						relation={col.relations["user"]!}
					/>
					<ManualShowField source="comment" />
					<ManualShowField source="additionalInfo" Component={JsonShowField} />
				</div>
			</TabsSection>
			<TabsSection>
				<div className={clsx("grid gap-y-4")}>
					<ActivityLogChanges />
				</div>
			</TabsSection>

			<TabsSection>
				<div className={clsx("grid gap-y-4")}>
					<ManualShowField source="id" />
					<ManualShowField source="ip" />
					<ManualShowField source="userAgent" />
					{/* <ManualShowField source="embeddedUserInfo" Component={JsonShowField} /> */}
					<ManualShowField
						source="embeddedUserInfo.email"
						label="Embedded user's email"
						description="This info is embedded in log"
					/>
					<ManualShowField
						source="embeddedUserInfo.userId"
						label="Embedded user's ID"
						description="This info is embedded in log"
					/>
					<ManualShowField
						source="embeddedUserInfo.roleId"
						label="Embedded user's role ID"
						description="This info is embedded in log"
					/>
				</div>
			</TabsSection>
		</TabsLayout>
	)
})
