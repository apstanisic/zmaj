import { RelationDef } from "@common/modules"
import { camel, title } from "radash"
import { v4 } from "uuid"

export type RelationBuilderInfo = {
	thisPropertyName: string
	thisColumnName: string
	thisTableName: string
	otherColumnName: string
	otherTableName: string
	otherPropertyName: string
	type: RelationDef["type"]
	junctionTableName?: string
	junctionThisColumnName?: string
	junctionOtherColumnName?: string
	label?: string
	hidden?: boolean
}

export function buildRelation(params: RelationBuilderInfo): RelationDef {
	const id = v4()
	return {
		id,
		tableName: params.thisTableName,
		relation: {
			id,
			createdAt: new Date(),
			fkName: `generated_fk_${params.thisTableName}`,
			template: null,
			hidden: params.hidden ?? false,
			label: params.label ?? title(params.otherTableName),
			propertyName: params.thisPropertyName,
			tableName: params.thisTableName,
			mtmFkName: params.type === "many-to-many" ? `generated_mtm_fk_${params.thisTableName}` : null,
		},
		collectionName: camel(params.thisTableName),
		columnName: params.thisColumnName,
		fieldName: camel(params.thisColumnName),
		propertyName: params.thisPropertyName,
		otherSide: {
			columnName: params.otherColumnName,
			tableName: params.otherTableName,
			collectionName: camel(params.otherTableName),
			fieldName: camel(params.otherColumnName),
			propertyName: params.otherPropertyName,
		},

		...(params.type !== "many-to-many"
			? { type: params.type }
			: {
					type: "many-to-many",
					junction: {
						collectionAuthzKey: `collections.${camel(params.junctionTableName!)}`,
						collectionName: camel(params.junctionTableName!),
						tableName: params.junctionTableName!,
						uniqueKey: `comp_uniq_${params.junctionTableName!}`,
						thisSide: {
							columnName: params.junctionThisColumnName!,
							fieldName: camel(params.junctionThisColumnName!),
							propertyName: camel(params.thisTableName),
							relationId: undefined,
						},

						otherSide: {
							columnName: params.junctionOtherColumnName!,
							fieldName: camel(params.junctionOtherColumnName!),
							propertyName: camel(params.thisTableName),
							relationId: undefined,
						},
					},
			  }),
	}
}
