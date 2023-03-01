import { useAuthz } from "@admin-panel/state/authz-state"
import { useInfraState } from "@admin-panel/state/useInfraState"
import { CollectionDef, FieldDef, RelationDef } from "@zmaj-js/common"
import { useCallback, useMemo } from "react"
import { throwInApp } from "../../shared/throwInApp"
import { Property } from "../../types/Property"
import { RaAction } from "../../types/RaAction"

function getFieldRelation(field: FieldDef, collection: CollectionDef): RelationDef | undefined {
	// Relation for current field
	// m2o and ownerO2O relation
	const m2oRelation = Object.values(collection.relations).find(
		(r) =>
			(r.type === "many-to-one" || r.type === "owner-one-to-one") &&
			r.fieldName === field.fieldName,
	)

	return m2oRelation
}

/**
 * Generate properties for all fields and relations
 *
 * Every field and relation is a property, except fields that are part of relation,
 * so it does not show twice
 *
 * We have to pass action and collection ,since we can't access contexts yet.
 */
export function useGenerateProperties(params: {
	action: RaAction
	collection: CollectionDef
}): Property[] {
	const { action, collection } = params
	const authz = useAuthz()
	const infraState = useInfraState()

	// only check for read, since it's only common requirement
	const canReadRel = useCallback(
		(rel: RelationDef) => {
			const rightCollection = infraState.data.find(
				(c) => c.collectionName === rel.otherSide.collectionName,
			)
			if (!rightCollection) return false
			if (rel.type !== "many-to-many") return authz.can("read", rightCollection.authzKey)

			const junctionCol = infraState.data.find(
				(c) => c.collectionName === rel.junction.collectionName,
			)

			// if it's m2m, user must be allowed both junction table and right table
			return (
				junctionCol &&
				authz.can("read", junctionCol.authzKey) &&
				authz.can("read", rightCollection.authzKey)
			)
		},
		[authz, infraState.data],
	)

	return useMemo(() => {
		const isList = action === "list"
		const toRender: Property[] = []

		// fields
		for (const field of Object.values(collection.fields)) {
			// don't render field if it's m2o relation, and user can access it
			const relation = getFieldRelation(field, collection)
			if (relation && canReadRel(relation)) continue

			// normal field
			// Sometimes, user should be able to create value, but not read it
			// should that field be hidden or shown for input
			// for example, admin can set password when creating user, but should not be able to
			// read it
			const allowed = action === "create" ? field.canCreate : field.canRead
			// const allowed = field.canRead
			if (allowed && field.fieldConfig[`${action}Hidden`] !== true) {
				toRender.push({ field, type: "field", property: field.fieldName })
			}
		}

		for (const rel of Object.values(collection.relations)) {
			if (rel.relation.hidden) continue

			if (!canReadRel(rel)) continue

			if (rel.type === "many-to-one" || rel.type === "owner-one-to-one") {
				toRender.push({
					field: collection.fields[rel.fieldName] ?? throwInApp("867843"),
					relation: rel,
					type: rel.type === "many-to-one" ? "many-to-one" : "owner-one-to-one",
					property: rel.propertyName,
				})
			}
			// It's making separate query for every ref, need to implement getReference
			else if (rel.type === "ref-one-to-one" && !isList) {
				toRender.push({
					relation: rel,
					type: "ref-one-to-one",
					property: rel.propertyName,
				})
			}
			//
			else if (rel.type === "one-to-many" && !isList) {
				if (!rel.relation.hidden) {
					toRender.push({
						relation: rel,
						type: "one-to-many",
						property: rel.propertyName,
					})
				}
			}
			//
			else if (rel.type === "many-to-many" && !isList) {
				if (!rel.relation.hidden) {
					toRender.push({
						relation: rel,
						type: "many-to-many",
						property: rel.propertyName,
					})
				}
			}
		}
		return toRender
	}, [action, collection, canReadRel])
}
