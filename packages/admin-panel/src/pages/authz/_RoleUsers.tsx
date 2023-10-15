import { CreateButton } from "@admin-panel/app-layout/buttons/CreateButton"
import { fullWidthFieldCss } from "@admin-panel/crud-layouts/get-field-width-css"
import { useRecord } from "@admin-panel/hooks/use-record"
import { Role } from "@zmaj-js/common"
import { clsx } from "clsx"
import { RelationContextProvider } from "../../context/relation-context"
import { TabsSection } from "../../crud-layouts/ui/tabs/TabsSection"
import { OneToManyField } from "../../generator/one-to-many/OneToManyField"
import { useResourceCollection } from "../../hooks/use-resource-collection"

/**
 * Show users that have current role
 */
export function RoleUsers(): JSX.Element {
	const col = useResourceCollection()
	const rel = col.relations["users"]
	const role = useRecord<Role>()
	if (!rel) return <></>

	return (
		<TabsSection>
			<RelationContextProvider value={rel}>
				<OneToManyField />
			</RelationContextProvider>
			<div className={clsx("flex justify-end", fullWidthFieldCss)}>
				<CreateButton
					label="Add new user"
					query={`?source=${JSON.stringify({ roleId: role?.id })}`}
					resource={"zmajUsers"}
					color="normal"
					variant="outlined"
					className="w-80"
					isDisabled={role?.id === undefined}
				/>
			</div>
		</TabsSection>
	)
}
