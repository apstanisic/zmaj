import { LayoutConfigSchema } from "@common/modules/infra-collections/layout/layout-config.schema"
import { camel, title } from "radash"
import { CollectionDef, Struct } from "src"
import { Except } from "type-fest"
import { v4 } from "uuid"
import { z } from "zod"

export type BuildCollectionOptions<T extends Struct = Struct> = Except<
	Partial<CollectionDef<T>>,
	"layoutConfig"
> & {
	layoutConfig?: z.input<typeof LayoutConfigSchema>
}

export function buildCollection<T extends Struct = Struct>(
	tableName: string,
	params: BuildCollectionOptions<T> = {},
): CollectionDef<T> {
	return {
		id: v4(),
		definedInCode: true,
		authzKey: params.authzKey ?? `collections.${camel(tableName)}`,
		createdAt: new Date(),
		hidden: false,
		pkField: "id",
		pkType: "uuid",
		disabled: false,
		tableName,
		displayTemplate: "{id}",
		fields: {},
		label: title(tableName),
		pkColumn: "id",
		collectionName: camel(tableName),
		isJunctionTable: false,
		relations: {},
		...params,
		layoutConfig: LayoutConfigSchema.parse(params.layoutConfig ?? {}),
	}
}
