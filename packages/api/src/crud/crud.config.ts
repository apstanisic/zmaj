import { Inject, Injectable } from "@nestjs/common"
import { ZodDto } from "@zmaj-js/common"
import { z } from "zod"
import { MODULE_OPTIONS_TOKEN } from "./crud.module-definition"

// {
//   //   throwIfSomeChangesAreForbidden: z.boolean().default(false),
//   //   checkBothSidesInOneToMany: z.boolean().default(false),
// }

const CrudConfigSchema = z.object({
	/**
	 * What data can we join in GET request
	 * Should we allow join in crud request
	 *
	 * - none - You can't join
	 * - toOne - you can join only m2o and owning side of o2o.
	 * - TODO all - You can do any join
	 *
	 * `all` can cause performance problems if joining o2m and m2m if there is many rows,
	 * since we can't limit amount of joined rows
	 *
	 */
	allowedJoin: z
		// .enum(["all", "toOne", "none"])
		.enum(["none", "toOne"])
		.default("none")
		// just for ts, since `all` is WIP
		.transform((v): "none" | "toOne" | "all" => v),
	/**
	 * What relation data can be changed with crud request
	 *
	 * - none - Only can change properties in current table (including fk values)
	 * - toManyFks - Only change fks in o2m and m2m table,
	 * this options should be set for admin panel to work correctly
	 * - TODO: toMany - Allow to change and create new records in o2m and m2m table
	 * - TODO: all - Allow to change m2o and owner-o2o properties of ref
	 */
	relationChange: z.enum(["none", "toManyFks"]).default("none"),
	/**
	 * Should we create m2m relation if we find default junction table (1pk, 2fks, 1 comp unique)
	 * TODO
	 */
	// inferManyToMany: z.undefined(),

	// fieldTransformers: z.array(z.custom<CrudFieldTransformHook>()).default([]),
})

export type CrudConfigParams = z.input<typeof CrudConfigSchema>

@Injectable()
export class CrudConfig extends ZodDto(CrudConfigSchema) {
	constructor(@Inject(MODULE_OPTIONS_TOKEN) params: CrudConfigParams) {
		super(params)
	}
}
