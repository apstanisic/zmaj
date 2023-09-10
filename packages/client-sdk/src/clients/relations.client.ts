import { sdkThrow } from "@client-sdk/errors/error-utils"
import { Data, endpoints, FieldMetadataModel, getEndpoints, RelationDef } from "@zmaj-js/common"
import { BaseModel } from "@zmaj-js/orm"
import { AxiosInstance } from "axios"
import { CrudClient } from "./crud.client"

const ep = getEndpoints((ep) => ep.infraRelations)

/**
 * TODO!!!! Not correct
 */
class RelationDefModel extends BaseModel {
	name = "relations"
	fields = this.buildFields((f) => ({
		...new FieldMetadataModel().fields,
	}))
}

export class RelationsClient extends CrudClient<RelationDefModel> {
	constructor(http: AxiosInstance) {
		super(http, endpoints.infraRelations.$base)
	}

	/**
	 * Convert one many-to-many relation to 2 many-to-one relation
	 *
	 * @param id Relation ID
	 * @returns Splited relations. If right table is system table, only 1 relation will be returned
	 */
	async splitManyToMany(
		junctionCollection: string,
	): Promise<[RelationDef] | [RelationDef, RelationDef]> {
		const url = ep.splitManyToMany.replace(":junctionCollection", junctionCollection)
		return this.http
			.put<Data<[RelationDef, RelationDef]>>(url)
			.then((res) => res.data.data)
			.catch(sdkThrow)
	}
	/**
	 * Convert 2 many-to-one relations to one many-to-many
	 *
	 * @param id1 Relation 1 ID
	 * @param id2 Relation 2 ID
	 * @returns Merged relation
	 */
	async joinManyToMany(junctionCollection: string): Promise<RelationDef> {
		const url = ep.joinManyToMany.replace(":junctionCollection", junctionCollection)
		return this.http
			.put<Data<RelationDef>>(url)
			.then((r) => r.data.data)
			.catch(sdkThrow)
	}
}
