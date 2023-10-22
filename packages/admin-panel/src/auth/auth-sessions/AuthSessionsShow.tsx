import { DeleteButton } from "@admin-panel/app-layout/buttons/DeleteButton"
import { ShowRecordAsJsonDialog } from "@admin-panel/app-layout/show/ShowRecordAsJsonDialog"
import { BooleanShowField } from "@admin-panel/field-components/boolean/BooleanShowField"
import { useIsAllowedSystem } from "@admin-panel/hooks/use-is-allowed"
import { memo } from "react"
import { LayoutSection } from "../../crud-layouts/ui/LayoutSection"
import { DateTimeShowField } from "../../field-components/datetime/DateTimeShowField"
import { GeneratedShowPage } from "../../generator/pages/GeneratedShowPage"
import { ManualShowField } from "../../shared/show/ManualShowField"
import { useIsCurrentDevice } from "./useIsCurrentDevice"

/**
 * TODO Add ability for plugins to inject permissions
 */
export const AuthSessionsShow = memo(() => {
	return (
		<GeneratedShowPage
			actions={
				<>
					<ShowRecordAsJsonDialog />
					<RemoveSessionButton />
				</>
			}
		>
			<LayoutSection largeGap>
				<IsCurrentDevice />
				<ManualShowField source="browser.name" label="Browser" />
				<ManualShowField source="os.name" label="OS" />
				<ManualShowField
					source="createdAt"
					label="Logged In At"
					Component={DateTimeShowField}
				/>
				<ManualShowField source="lastUsed" Component={DateTimeShowField} />
				<ManualShowField source="ip" label="IP Address" />
			</LayoutSection>
		</GeneratedShowPage>
	)
})

const RemoveSessionButton = (): JSX.Element => {
	const allowed = useIsAllowedSystem("account", "deleteSessions")
	const isCurrent = useIsCurrentDevice()
	return <DeleteButton label="Sign Out Device" disabled={isCurrent.data || !allowed} />
}

const IsCurrentDevice = memo((): JSX.Element => {
	const isCurrent = useIsCurrentDevice()
	return (
		<ManualShowField
			source="isCurrentDevice"
			value={isCurrent.data ?? false}
			Component={BooleanShowField}
		/>
	)
})
