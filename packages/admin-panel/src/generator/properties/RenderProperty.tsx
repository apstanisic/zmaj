import { memo } from "react"
import { FieldContextProvider } from "../../context/field-context"
import { RelationContextProvider } from "../../context/relation-context"
import { AdminPanelError } from "../../shared/AdminPanelError"
import { Property } from "../../types/Property"
import { ManyToManyField } from "../many-to-many/ManyToManyField"
import { OneToManyField } from "../one-to-many/OneToManyField"
import { RefOneToOneField } from "../ref-one-to-one/RefOneToOneField"
import { GeneratedManyToOneRouterField } from "../references/many-to-one/GeneratedManyToOneRouterField"
import { GeneratedOneToManyRouterField } from "../references/one-to-many/GeneratedOneToManyRouterField"
import { GeneratedOwnerOneToOneRouterField } from "../references/owner-one-to-one/GeneratedOwnerOneToOneRouterField"
import { GeneratedField } from "./GeneratedField"

export const RenderProperty = memo(({ property }: { property: Property }) => {
	if (property.type === "field") {
		return (
			<FieldContextProvider value={property.field}>
				{property.Render ? <property.Render /> : <GeneratedField field={property.field} />}
			</FieldContextProvider>
		)
	}
	if (property.type === "many-to-one") {
		return (
			<FieldContextProvider value={property.field}>
				<RelationContextProvider value={property.relation}>
					<GeneratedManyToOneRouterField />
				</RelationContextProvider>
			</FieldContextProvider>
		)
	}

	if (property.type === "owner-one-to-one") {
		// TODO
		return (
			<FieldContextProvider value={property.field}>
				<RelationContextProvider value={property.relation}>
					<GeneratedOwnerOneToOneRouterField />
				</RelationContextProvider>
			</FieldContextProvider>
		)
	}

	if (property.type === "one-to-many") {
		return (
			<RelationContextProvider value={property.relation}>
				<GeneratedOneToManyRouterField />
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
