import { FormJsonInput } from "@admin-panel/ui/Controlled"
import { TabsSection } from "../../../crud-layouts/ui/tabs/TabsSection"

export function PermissionConditionsInput(): JSX.Element {
	return (
		<TabsSection>
			<FormJsonInput name="conditions" label="Conditions" />
		</TabsSection>
	)
}
