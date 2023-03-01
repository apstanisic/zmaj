import { ModelSchema, DbFieldSchema } from "@common/zod"
import { z } from "zod"
import { ColumnDataTypeSchema } from "./column-data-type.schema"
import { FieldConfigSchema } from "./field-config.schema"
import { FieldDef } from "./field-def.type"
import { FieldMetadataSchema } from "./field-metadata.schema"

export const FieldDefSchema = ModelSchema<FieldDef>()(
	FieldMetadataSchema.omit({ fieldConfig: true }).extend({
		fieldConfig: FieldConfigSchema,
		collectionName: DbFieldSchema,
		fieldName: DbFieldSchema,
		isPrimaryKey: z.boolean().default(false),
		isUnique: z.boolean().default(false),
		isForeignKey: z.boolean().default(false),
		isNullable: z.boolean().default(true),
		isAutoIncrement: z.boolean().default(false),
		hasDefaultValue: z.boolean().default(false),
		dbDefaultValue: z.string().nullable().default(null),
		dataType: ColumnDataTypeSchema,
		dbRawDataType: z.string(),
	}),
)
