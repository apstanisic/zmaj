import { AuthorizationService } from "@api/authorization/authorization.service"
import { throw403 } from "@api/common/throw-http"
import { emsg } from "@api/errors"
import { Injectable } from "@nestjs/common"
import { AuthUser, CollectionDef } from "@zmaj-js/common"
import { InfraStateService } from "./infra-state/infra-state.service"

/**
 * Get infra data. It checks permissions
 * It only returns all infra
 */
@Injectable()
export class UserInfraService {
	constructor(
		private authz: AuthorizationService,
		private infraState: InfraStateService, //
	) {}

	/**
	 * Get infra collections
	 *
	 * @param user Signed in user
	 * @returns Collections that they are allowed to read
	 */
	getInfra(user?: AuthUser): CollectionDef[] {
		const allowed = this.authz.checkSystem("infra", "read", { user })
		if (!allowed) return throw403(737823, emsg.noAuthz)

		return Object.values(this.infraState.collections)
	}

	/**
	 *
	 * Moved data for general user to special module
	 *
	 *
	 */

	/**
	 * Get key that is used for caching state. It has to be tied to current user and to infra state
	 * version. If user is not signed in, we can generalize for every user (public role)
	 */
	// private getCacheKey(user?: AuthUser): string {
	//   const version = this.infraState.version
	//   const userId = user?.userId ?? PUBLIC_ROLE_ID
	//   return `SYSTEM_INFRA__${version}__${userId}`
	// }

	// private async setCache(data: CollectionDef[], user: AuthUser | undefined): Promise<void> {
	//   await this.cacheManager.set(this.getCacheKey(user), data, { ttl: 600 })
	// }

	// private async getFromCache(
	//   user: AuthUser | undefined,
	// ): Promise<CollectionDef[] | undefined> {
	//   const cached = await this.cacheManager.get<CollectionDef[]>(this.getCacheKey(user))
	//   return cached
	// }

	/** Get infra with caching */
	// async getInfra(user?: AuthUser): Promise<CollectionDef[]> {
	//   const cached = await this.getFromCache(user)
	//   if (cached) return cached

	//   const data = this.getFreshAllowedInfra(user)

	//   await this.setCache(data, user)
	//   return data
	// }

	// private getFreshAllowedInfra(user?: AuthUser): CollectionDef[] {
	//   const rules = this.authz.getRules(user)

	//   const canRead = Object.values(this.infraState.collections).filter((col) =>
	//     rules.can("read", col.collectionName),
	//   )
	//   return produce(canRead, (draft) => {
	//     for (const collection of draft) {
	//       //
	//       // Fields
	//       //
	//       const allowedFieldIds: string[] = []
	//       for (let i = 0; i < collection.fullFields.length; i++) {
	//         const field = collection.fullFields[i]!
	//         const isAllowed = rules.can("read", collection.tableName, field.fieldName)

	//         if (isAllowed) {
	//           allowedFieldIds.push(field.id)
	//         } else {
	//           delete collection.properties[field.fieldName]
	//         }
	//       }
	//       // we have to first check all. We can't change/mutate array while looping
	//       collection.fields = collection.fields.filter((f: FieldMetadata) =>
	//         allowedFieldIds.includes(f.id),
	//       )
	//       collection.fullFields = collection.fullFields.filter((f) => allowedFieldIds.includes(f.id))

	//       //
	//       // Relations
	//       //
	//       const allowedRelationIds: string[] = []
	//       for (let i = 0; i < collection.fullRelations.length; i++) {
	//         const relation = collection.fullRelations[i]!
	//         const isAllowed = rules.can("read", collection.tableName, relation.propertyName)
	//         // remove item from array if not allowed. "Mutate"
	//         if (isAllowed) {
	//           allowedRelationIds.push(relation.id)
	//         } else {
	//           delete collection.properties[relation.propertyName]
	//         }
	//       }

	//       // we have to first check all. We can't change/mutate array while looping
	//       collection.relations = collection.relations.filter((r: RelationMetadata) =>
	//         allowedRelationIds.includes(r.id),
	//       )
	//       collection.fullRelations = collection.fullRelations.filter((f) =>
	//         allowedRelationIds.includes(f.id),
	//       )
	//     }
	//     //
	//   })
	// }

	// /**
	//  * We are returning all data,
	//  * but react-admin might request paginated, so we simply paginate internally
	//  */
	// paginate(
	//   unpaginated: CollectionDef[],
	//   meta: CrudRequest,
	// ): ResponseWithCount<CollectionDef> {
	//   const { page, limit } = meta.query
	//   const offset = pageToOffset(page, limit)
	//   const data = unpaginated.slice(offset, offset + limit)
	//   return { data, count: unpaginated.length }
	// }
}
