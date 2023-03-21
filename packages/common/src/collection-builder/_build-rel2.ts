import { OnlyRelations } from "@common/modules/crud-types/only-relations.type"
import {
	ManyToMany,
	ManyToOne,
	OneToMany,
	OneToOne,
} from "@common/modules/crud-types/relation.types"
import { StripEntityRef } from "@common/modules/crud-types/strip-entity-ref.type"
import { title } from "radash"
import { v4 } from "uuid"
import { OnlyFields, RelationDef, snakeCase } from ".."
import { EmptyObject } from "type-fest"

type DefineMtm<From, To, Junction> = Shared<From, To> & {
	type: "many-to-many"
	otherCollection: string
	junctionCollection: string
	junctionThisField: Extract<keyof Junction, string>
	junctionOtherField: Extract<keyof Junction, string>
}

type DefineOtm<From, To> = Shared<From, To> & {
	type: "one-to-many"
}

type DefineMto<From, To> = Shared<From, To> & {
	type: "many-to-one"
}

type DefineOto<From, To> = Shared<From, To> & {
	type: "owner-one-to-one" | "ref-one-to-one"
}

type Shared<From, To> = {
	label?: string
	otherCollection: string
	field: Extract<keyof OnlyFields<From>, string>
	otherField: Extract<keyof OnlyFields<To>, string>
	reverse?: Extract<keyof OnlyRelations<StripEntityRef<To>>, string>
	hidden?: boolean
}

export type DefineRelationsParams<T> = {
	[key in keyof Required<OnlyRelations<T>>]: DefineSingleRelation<T, NonNullable<T[key]>>
}

export type DefineSingleRelation<From, To> = NonNullable<To> extends OneToMany<infer R>
	? DefineOtm<From, R>
	: NonNullable<To> extends ManyToOne<infer R>
	? DefineMto<From, R>
	: NonNullable<To> extends OneToOne<infer R>
	? DefineOto<From, R>
	: NonNullable<To> extends ManyToMany<infer R>
	? DefineMtm<From, R, any>
	: never

export function buildRelation2<From, To>(
	params: DefineSingleRelation<From, To>,
	collectionName: string,
	propertyName: string,
): RelationDef {
	const id = v4()
	const tableName = snakeCase(collectionName)

	return {
		id,
		tableName,
		relation: {
			id,
			createdAt: new Date(),
			fkName: `generated_fk_${tableName}`,
			template: null,
			hidden: params.hidden ?? false,
			label: params.label ?? title(params.otherCollection),
			propertyName: propertyName,
			tableName: tableName,
			mtmFkName: params.type === "many-to-many" ? `generated_mtm_fk_${tableName}` : null,
		},
		collectionName: collectionName,
		columnName: snakeCase(params.field),
		fieldName: params.field,
		propertyName: propertyName,
		otherSide: {
			columnName: snakeCase(params.otherField),
			tableName: snakeCase(params.otherCollection),
			collectionName: params.otherCollection,
			fieldName: params.otherField,
			propertyName: params.reverse,
		},

		...(params.type !== "many-to-many"
			? { type: params.type }
			: {
					type: "many-to-many",
					junction: {
						collectionAuthzKey: `collections.${params.junctionCollection}`,
						collectionName: params.junctionCollection,
						tableName: snakeCase(params.junctionCollection),
						uniqueKey: `comp_uniq_${snakeCase(params.junctionCollection)}`,
						thisSide: {
							columnName: snakeCase(params.junctionThisField),
							fieldName: params.junctionThisField,
							propertyName: collectionName,
							relationId: undefined,
						},

						otherSide: {
							columnName: snakeCase(params.junctionOtherField),
							fieldName: params.junctionOtherField!,
							propertyName: params.otherCollection,
							relationId: undefined,
						},
					},
			  }),
	}
}
