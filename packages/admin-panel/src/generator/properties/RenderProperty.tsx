import { memo } from "react"
import { FieldContextProvider } from "../../context/field-context"
import { RelationContextProvider } from "../../context/relation-context"
import { AdminPanelError } from "../../shared/AdminPanelError"
import { Property } from "../../types/Property"
import { ManyToManyField } from "../many-to-many/ManyToManyField"
import { ToOneField } from "../many-to-one/ToOneField"
import { OneToManyField } from "../one-to-many/OneToManyField"
import { RefOneToOneField } from "../ref-one-to-one/RefOneToOneField"
import { GeneratedField } from "./GeneratedField"

export const RenderProperty = memo(({ property }: { property: Property }) => {
	if (property.type === "field") {
		return (
			<FieldContextProvider value={property.field}>
				{property.Render ? <property.Render /> : <GeneratedField field={property.field} />}
			</FieldContextProvider>
		)
	}
	if (property.type === "many-to-one" || property.type === "owner-one-to-one") {
		return (
			<FieldContextProvider value={property.field}>
				<RelationContextProvider value={property.relation}>
					<ToOneField />
				</RelationContextProvider>
			</FieldContextProvider>
		)
	}

	if (property.type === "one-to-many") {
		return (
			<RelationContextProvider value={property.relation}>
				<OneToManyField />
			</RelationContextProvider>
		)
	}

	if (property.type === "ref-one-to-one") {
		return (
			<RelationContextProvider value={property.relation}>
				<RefOneToOneField />
			</RelationContextProvider>
		)
	}

	if (property.type === "many-to-many") {
		return (
			<RelationContextProvider value={property.relation}>
				<ManyToManyField />
			</RelationContextProvider>
		)
	}

	// if (property.type === "owner-one-to-one" || property.type === 'ref-one-to-one') {
	//   return (
	//     <RelationContextProvider value={property.relation}>
	//       <OneToManyField />
	//     </RelationContextProvider>
	//   )
	// }

	throw new AdminPanelError("#91263192")
})
