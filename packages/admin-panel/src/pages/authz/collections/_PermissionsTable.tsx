import { Table } from "@admin-panel/ui/Table"
import { Permission } from "@zmaj-js/common"
import { LayoutSection } from "../../../crud-layouts/ui/LayoutSection"
import { useUserCollections } from "../../../hooks/use-user-collections"
import { CollectionPermissionsRow } from "./CollectionPermissionsRow"

export function PermissionsTable(props: { allowedPermissions: Permission[] }): JSX.Element {
	const nonSystemCollections = useUserCollections()

	if (nonSystemCollections.length === 0) {
		return <p className="mt-8 text-center text-xl">No user collections</p>
	}

	return (
		<LayoutSection>
			<Table>
				<Table.Head>
					<Table.Row>
						<Table.HeaderColumn align="left">Resource</Table.HeaderColumn>
						<Table.HeaderColumn align="center" className="w-16">
							Read
						</Table.HeaderColumn>
						<Table.HeaderColumn align="center" className="w-16">
							Create
						</Table.HeaderColumn>
						<Table.HeaderColumn align="center" className="w-16">
							Update
						</Table.HeaderColumn>
						<Table.HeaderColumn align="center" className="w-16">
							Delete
						</Table.HeaderColumn>
					</Table.Row>
				</Table.Head>
				<Table.Body>
					{nonSystemCollections.map((c) => (
						<Table.Row key={c.id}>
							<CollectionPermissionsRow
								collection={c}
								allowedPermissions={props.allowedPermissions}
							/>
						</Table.Row>
					))}
				</Table.Body>
			</Table>
		</LayoutSection>
	)
}
