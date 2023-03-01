import { FieldConfigSchema } from "@common/modules/infra-fields/field-config.schema"
import { FieldDefSchema } from "@common/modules/infra-fields/field-def.schema"
import { FieldDef } from "@common/modules/infra-fields/field-def.type"
import { zodCreate } from "@common/zod/zod-create"
import { startOfYear } from "date-fns"
import { camel, title } from "radash"
import { SetRequired, WritableDeep } from "type-fest"
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
