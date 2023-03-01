import { GetUser } from "@api/authentication/get-user.decorator"
import { AuthorizationService } from "@api/authorization/authorization.service"
import { SetSystemPermission } from "@api/authorization/set-system-permission.decorator"
import { wrap } from "@api/common/wrap"
import { InfraStateService } from "@api/infra/infra-state/infra-state.service"
import { Controller, Get } from "@nestjs/common"
import { AuthUser, Data, CollectionDef } from "@zmaj-js/common"

/**
 * Admin panel needs some info to be provided, so it can show proper pages/ui.
 */
@Controller("admin-panel-wip")
export class AdminPanelInfraController {
	constructor(
		private authz: AuthorizationService, //
		private infraState: InfraStateService,
	) {}

	@SetSystemPermission("adminPanel", "access")
	@Get("infra")
	async getAdminPanelInfra(@GetUser() user?: AuthUser): Promise<Data<CollectionDef[]>> {
		const rules = this.authz.getRules(user)

		const canRead = Object.values(this.infraState.collections).filter((col) =>
			rules.can("read", col.authzKey),
		)
		// const cloned = structuredClone(canRead as Writable<CollectionDef>[])
		const toReturn: CollectionDef[] = []
		for (const ogCollection of canRead) {
			const collection = structuredClone(ogCollection)

			collection.fields = {}
			for (const [property, field] of Object.entries(ogCollection.fields)) {
				const isAllowed = rules.can("read", collection.authzKey, property)
				if (isAllowed) {
					collection.fields[property] = field
				}
			}

			collection.relations = {}
			for (const [property, relation] of Object.entries(ogCollection.relations)) {
				const isAllowed = rules.can("read", collection.authzKey, property)
				if (isAllowed) {
					collection.relations[property] = relation
				}
			}
			toReturn.push(collection)
		}
		return wrap(toReturn)
	}
}
