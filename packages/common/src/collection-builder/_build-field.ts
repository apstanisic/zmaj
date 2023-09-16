import { FieldConfigSchema } from "@common/modules/infra-fields/field-config.schema"
import { FieldDefSchema } from "@common/modules/infra-fields/field-def.schema"
import { FieldDef } from "@common/modules/infra-fields/field-def.type"
import { zodCreate } from "@common/zod/zod-create"
import { BaseModel } from "@zmaj-js/orm"
import { startOfYear } from "date-fns"
import { camel, title } from "radash"
import { Except, SetRequired, WritableDeep } from "type-fest"
import { v4 } from "uuid"
import { snakeCase } from "../utils/lodash"

export type BuildCollectionFieldParams = SetRequired<
	Partial<FieldDef>,
	"fieldName" | "tableName" | "dataType"
>

export function buildField(params: BuildCollectionFieldParams): FieldDef {
	const { fieldName, tableName, dataType, ...override } = params as WritableDeep<typeof params>

	return zodCreate(FieldDefSchema, {
		createdAt: startOfYear(2022),
		fieldName: fieldName,
		label: title(fieldName),
		columnName: snakeCase(fieldName),
		tableName: tableName,
		// fieldConfig: {},
		collectionName: camel(tableName),
		dataType: dataType,
		dbRawDataType: dataType,
		id: v4(),
		...override,
		fieldConfig: zodCreate(FieldConfigSchema, override.fieldConfig ?? {}),
	})
}

type FieldParams = Except<Partial<FieldDef>, "dataType">
export function buildFields<TModel extends BaseModel>(
	model: TModel,
	fields: Partial<Record<keyof TModel["fields"], FieldParams>> = {},
): Record<string, FieldDef> {
	const tableName = model.tableName ?? snakeCase(model.name)
	const toReturn: Record<string, FieldDef> = {}
	for (const [property, field] of Object.entries(model.fields)) {
		// ts not working with .entries
		const additionalConfig = fields[property as keyof TModel["fields"]]

		const generated = buildField({
			tableName,
			...additionalConfig,
			...field,
			dataType: field.dataType as any, // TODO FIX THIS
			isPrimaryKey: field.isPk,
			fieldName: property,
			columnName: field.columnName ?? snakeCase(property),
		})
		toReturn[property] = generated
	}
	return toReturn
}
