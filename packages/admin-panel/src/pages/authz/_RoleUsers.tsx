import { CreateButton } from "@admin-panel/app-layout/buttons/CreateButton"
import { fullWidthFieldCss } from "@admin-panel/crud-layouts/get-field-width-css"
import { useRecord } from "@admin-panel/hooks/use-record"
import { Role } from "@zmaj-js/common"
import { clsx } from "clsx"
import { useCollectionContext } from "../../context/collection-context"
import { RelationContextProvider } from "../../context/relation-context"
import { TabsSection } from "../../crud-layouts/ui/tabs/TabsSection"
import { OneToManyField } from "../../generator/one-to-many/OneToManyField"

/**
 * Show users that have current role
 */
export function RoleUsers(): JSX.Element {
	const col = useCollectionContext()
	const rel = col.relations["users" satisfies keyof Role]
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
					small={false}
					variant="normal"
					outline
					className="w-80"
					isDisabled={role?.id === undefined}
				/>
			</div>
		</TabsSection>
	)
}
