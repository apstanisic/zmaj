import { AuthorizationService } from "@api/authorization/authorization.service"
import { throw500 } from "@api/common/throw-http"
import { ForbiddenException, Injectable } from "@nestjs/common"
import { AuthUser, RelationDef, Struct, isIdType } from "@zmaj-js/common"
import { IdType, RepoManager, Transaction } from "@zmaj-js/orm"

/**
 * Params that must be provided to update relation property
 */
type UpdateParams = {
	/**
	 * Relation whose value we want to update
	 */
	relation: RelationDef
	/**
	 * Changes to that relation
	 */
	changes: any
	/**
	 * We must use this inside transaction, so we don't change records partially
	 */
	trx: Transaction
	/**
	 * Record for which we want to change values
	 */
	leftRecord: Struct
	/**
	 * User that is changing data
	 */
	user?: AuthUser
}

/**
 * Params that must be provided to check permissions for relation
 */
type CheckPermissionParams = Pick<UpdateParams, "relation" | "leftRecord" | "user"> & {
	/**
	 * All record on right side ("many" in x2m)
	 * We need those records so we can check permissions, since conditions require data
	 */
	rightRecords: Struct[]
}

type ChangeToManyResult<T extends Struct = Struct> = {
	added: { changed: T[]; forbidden: IdType[] }
	removed: { changed: T[]; forbidden: IdType[] }
}

/**
 * @deprecated
 */
@Injectable()
export class CrudUpdateToMany {
	/**
	 * Should we throw if some fks are not allowed to be changed (by permission)
	 * We can just ignored those, or we can throw
	 */
	throwIfSomeChangesAreForbidden = false
	/**
	 * Should we check both sides for permissions
	 * If o2m posts adds comments, should we check if we can change post_id and posts.comments
	 * property
	 */
	checkBothSidesInOneToMany = true

	/**
	 * Constructor
	 *
	 * @param repoManager Needed for updating data in database
	 * @param authz Needed for checking if user is allowed to change data
	 */
	constructor(
		private readonly repoManager: RepoManager,
		private readonly authz: AuthorizationService,
	) {}

	/**
	 * Update property that is one-to-many or many-to-many relation
	 *
	 * @returns Added, removed records, as well as ids that we were not allowed to change
	 */
	async changeToMany({
		relation,
		trx: em,
		leftRecord,
		user,
		changes,
	}: UpdateParams): Promise<ChangeToManyResult> {
		// result that will be returned
		const result: ChangeToManyResult = {
			added: { changed: [], forbidden: [] },
			removed: { changed: [], forbidden: [] },
		}

		// it's often the case that this value is provided by UI form, but not used
		// so we don't do anything if no value is provided
		if (changes.added.length === 0 && changes.removed.length === 0) return result

		// ensure that we have left record id
		const leftId = leftRecord[relation.fieldName]
		if (!isIdType(leftId)) throw500(5189623)

		// get repo
		const rightRepo = this.repoManager.getRepo(relation.otherSide.tableName)
		// find ids
		const wantToAdd = await rightRepo.findWhere({ trx: em, where: { id: { $in: changes.added } } })
		const wantToRemove = await rightRepo.findWhere({
			trx: em,
			where: { id: { $in: changes.removed } },
		})

		// check if every record is allowed to update
		// it will either throw if there is forbidden record, or add record id to forbidden array
		// if user allows it

		const toAdd = this.checkPermissions({
			relation,
			leftRecord,
			rightRecords: wantToAdd,
			user,
		})
		result.added.forbidden = toAdd.forbidden

		const toRemove = this.checkPermissions({
			relation,
			leftRecord,
			rightRecords: wantToRemove,
			user,
		})
		result.removed.forbidden = toRemove.forbidden

		// it's different when deleting m2m and o2m, since in m2m we are deleting/creating records
		// in junction table, while in o2m we are updating fk to either null (disconnect) or to new id (connect)

		// Many to Many
		if (relation.type === "many-to-many") {
			// we need junction repo
			const junctionRepo = this.repoManager.getRepo(relation.junction.tableName)

			// don't send request if there are no records
			if (toAdd.allowed.length > 0) {
				// for every added record, create new junction row
				result.added.changed = await junctionRepo.createMany({
					trx: em,
					data: toAdd.allowed.map((rightId) => {
						// ensure that right record contains id (it should always be true)
						// const rightId = rightRecord[relation.rightField]
						// if (isNil(rightId)) throw new InternalServerErrorException("5419732")

						// we create junction record with ids
						return {
							[relation.junction.thisSide.fieldName]: leftId,
							[relation.junction.otherSide.fieldName]: rightId, //
						}
					}),
				})
			}

			if (toRemove.allowed.length > 0) {
				// delete all junction rows
				result.removed.changed = await junctionRepo.deleteWhere({
					trx: em,
					where: {
						// we have left record id
						[relation.junction.thisSide.fieldName]: leftId,
						[relation.junction.otherSide.fieldName]: {
							$in: toRemove.allowed, //.map((row) => {
							// ensure that id is provided (should always be true)
							// const rightId = row[relation.rightField]
							// if (isNil(rightId)) throw new InternalServerErrorException("5419732")
							//   return rightId
							// }),
						},
					},
				})
			}
		}
		// O2M
		else {
			if (toAdd.allowed.length > 0) {
				// set new fk to point to left record
				result.added.changed = await rightRepo.updateWhere({
					changes: { [relation.otherSide.fieldName]: leftId },
					where: toAdd.allowed,
					// records: toAdd.allowed,
					trx: em,
				})
			}

			if (toRemove.allowed.length > 0) {
				// set new fk to point to null (removes record from pointing to left record)
				result.removed.changed = await rightRepo.updateWhere({
					changes: { [relation.otherSide.fieldName]: null },
					// records: toRemove.allowed,
					where: toRemove.allowed,
					trx: em,
				})
			}
		}

		return result
	}

	/**
	 * Check if changes are allowed
	 *
	 * It will throw if not allowed, and return records that are allowed to be updated.
	 * If `throwIfSomeChangesAreForbidden` is `true`, method will throw on any forbidden value
	 * If value is `false` method will simply ignore that value, and put it into forbidden array of ids
	 *
	 * @returns Object with forbidden ids and with allowed data
	 */
	private checkPermissions(params: CheckPermissionParams): {
		forbidden: IdType[]
		allowed: IdType[]
	} {
		const { relation, leftRecord, rightRecords, user } = params

		const allowed: IdType[] = []
		const forbidden: IdType[] = []

		// for every record we check permissions
		for (const row of rightRecords) {
			// check if main side is allowed
			const leftSideAllowed = this.authz.check({
				user,
				action: "update",
				resource: `collections.${relation.collectionName}`,
				field: relation.propertyName,
				record: leftRecord,
			})

			// check if right (many) side is allowed
			const rightSideAllowed = this.authz.check({
				user,
				action: "update",
				resource: `collections.${relation.otherSide.collectionName}`,
				record: row,
				field: "id",
			})

			const rightId = row[relation.otherSide.fieldName]
			// should always be ID
			if (!isIdType(rightId)) throw500(967412)

			// we always check many side
			// in o2m, we must check if we can change fk, in m2m we always check if we can change property
			if (!rightSideAllowed) {
				forbidden.push(rightId)
				continue
			}

			// if m2m, both sides must be allowed
			if (relation.type === "many-to-many" && !leftSideAllowed) {
				forbidden.push(rightId)
				continue
			}
			// we can choose for o2m if we want to check left "one" side
			if (!leftSideAllowed && this.checkBothSidesInOneToMany) {
				forbidden.push(rightId)
				continue
			}

			// add row to allowed if we didn't call `continue`
			allowed.push(rightId)
		}

		// if not all rows are allowed and flag is provided throw
		if (this.throwIfSomeChangesAreForbidden && forbidden.length !== 0) {
			throw new ForbiddenException("96123912")
		}

		return { allowed, forbidden }
	}
}
