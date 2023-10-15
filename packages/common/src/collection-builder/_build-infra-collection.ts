import { LayoutConfigSchema } from "@common/modules/infra-collections/layout/layout-config.schema"
import { camel, title } from "radash"
import { CollectionDef } from "src"
import { Except } from "type-fest"
import { v4 } from "uuid"
import { z } from "zod"

export type BuildCollectionOptions = Except<Partial<CollectionDef>, "layoutConfig"> & {
	layoutConfig?: z.input<typeof LayoutConfigSchema>
}

export function buildCollection(
	tableName: string,
	params: BuildCollectionOptions = {},
): CollectionDef {
	return {
		id: v4(),
		definedInCode: true,
		authzKey: params.authzKey ?? `collections.${params.collectionName ?? camel(tableName)}`,
		createdAt: new Date(),
		hidden: false,
		pkField: "id",
		pkType: "uuid",
		disabled: false,
		tableName,
		displayTemplate: "{id}",
		authzMustManage: false,
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
