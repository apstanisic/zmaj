import { ActivityLog, endpoints } from "@zmaj-js/common"
import { AxiosInstance } from "axios"
import { CrudClient } from "./crud.client"

type ActivityLogCrud = CrudClient<ActivityLog>

type AvailableMethods = Pick<ActivityLogCrud, "deleteById" | "getById" | "getMany">

export class ActivityLogClient implements AvailableMethods {
	#crud: CrudClient<ActivityLog>

	constructor(client: AxiosInstance) {
		this.#crud = new CrudClient<ActivityLog>(client, endpoints.activityLog.$base)
		Object.assign(this, {
			deleteById: this.#crud.deleteById.bind(this),
			getById: this.#crud.getById.bind(this),
			getMany: this.#crud.getMany.bind(this),
			//
		})
	}
	getById!: ActivityLogCrud["getById"]
	deleteById!: ActivityLogCrud["deleteById"]
	getMany!: ActivityLogCrud["getMany"]
}
