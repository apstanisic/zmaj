import { throw500 } from "@api/common/throw-http"
import { BootstrapRepoManager } from "@api/database/orm-specs/BootstrapRepoManager"
import { OrmRepository } from "@api/database/orm-specs/OrmRepository"
import { SchemaInfoService } from "@api/database/schema/schema-info.service"
import { InfraService } from "@api/infra/infra.service"
import { Injectable, Logger } from "@nestjs/common"
import {
	ForeignKey,
	getFreeValue,
	CollectionMetadata,
	FieldMetadata,
	RelationMetadata,
	RelationMetadataCollection,
	RelationMetadataSchema,
	isIn,
	zodCreate,
	RelationDef,
} from "@zmaj-js/common"
import { camel, title } from "radash"
import { SetOptional, SetRequired } from "type-fest"

/**
 * Sync relations with FKs. This ensures that relations are valid, and can freely be used
 * inside the system without worrying if they're out of sync
 */
@Injectable()
export class InfraSchemaRelationsSyncService {
	private logger = new Logger(InfraSchemaRelationsSyncService.name)
	/** Fks */
	private fks: readonly ForeignKey[] = []
	/** Collections */
	private collections: readonly CollectionMetadata[] = []
	/** Relations */
	private relations: readonly RelationMetadata[] = []
	/** Fields */
	private fields: readonly FieldMetadata[] = []

	constructor(
		private readonly infraService: InfraService,
		private readonly schemaInfo: SchemaInfoService,
		private bootstrapRepoManager: BootstrapRepoManager,
	) {
		this.repo = this.bootstrapRepoManager.getRepo(RelationMetadataCollection)
	}
	repo: OrmRepository<RelationMetadata>

	/** Sync relations with database */
	async sync(): Promise<void> {
		await this.getFreshState()

		await this.removeInvalidRelations()
		await this.splitInvalidManyToMany()
		await this.createMissingRelations()
		await this.fixNamingCollisions()
	}

	async getFreshState(): Promise<void> {
		this.fields = await this.infraService.getFieldMetadata()
		this.collections = await this.infraService.getCollectionMetadata()
		this.relations = await this.infraService.getRelationMetadata()
		this.fks = await this.schemaInfo.getForeignKeys()
	}

	/**
	 * Execute this action when relations were changed
	 */
	async onChange(): Promise<void> {
		this.relations = await this.infraService.getRelationMetadata()
	}

	/** Remove relations without corresponding foreign key */
	private async removeInvalidRelations(): Promise<void> {
		const invalidRelationIds = this.relations
			.filter((relation) => {
				// should always exist, since it's based on fk
				// system relation are not in db so it's safe
				const collection =
					this.collections.find((col) => col.tableName === relation.tableName) ?? throw500(78324329)

				// relation must contain fk
				// collection table must be in this fk, and name must match
				const relevantFkExist = this.fks.some(
					(fk) =>
						fk.fkName === relation.fkName &&
						isIn(collection.tableName, [fk.fkTable, fk.referencedTable]),
				)
				if (!relevantFkExist) {
					this.logger.log(
						`Removing invalid relation ${relation.tableName}.${relation.propertyName}`,
					)
				}
				// return true if fk does not exist
				return !relevantFkExist
			})
			// get only id of relation
			.map((rel) => rel.id)

		if (invalidRelationIds.length === 0) return

		// remove invalid relations
		// await this.db.start(RelationMetadataCollection).whereIn("id", invalidRelationIds).del()
		await this.repo.deleteWhere({ where: { id: { $in: invalidRelationIds } } })
		// await this.db.start(RelationMetadataCollection).whereIn("id", invalidRelationIds).del()

		await this.onChange()
	}

	/**
	 * This will get first free property name. If relation id is provided, method will
	 * compare propertyName with itself
	 */
	getFreePropertyName(
		relation: Pick<RelationDef, "tableName" | "propertyName"> & Partial<Pick<RelationDef, "id">>,
	): string {
		// fields in collection that current relation is located
		const fieldsPropertyNames = this.fields
			.filter((f) => f.tableName === relation.tableName)
			.map((f) => f.fieldName)

		// relations in same collection
		const relationsPropertyNames = this.relations
			// don't compare with itself
			.filter((r) => r.tableName === relation.tableName && r.id !== relation.id)
			.map((r) => r.propertyName)

		const takenPropertyNames = [...fieldsPropertyNames, ...relationsPropertyNames]

		// value is free if it's not included in fields and relations
		const freePropertyName = getFreeValue(
			relation.propertyName,
			(val) => !takenPropertyNames.includes(val),
		)
		return freePropertyName
	}
	/**
	 * Create missing relations
	 *
	 * Foreign key exists, but not relation metadata in db
	 * It will always create m2o-o2m combo, never m2m
	 */
	private async createMissingRelations(): Promise<void> {
		const missingRelations: RelationMetadata[] = []

		for (const fk of this.fks) {
			// many side (side where fk is located)
			if (fk.fkTable.startsWith("zmaj")) continue
			// no support for self referencing fk, for now
			if (fk.fkTable === fk.referencedTable) continue
			// find collection
			const manyCollection = this.collections.find((col) => col.tableName === fk.fkTable)
			if (!manyCollection) throw500(471024)

			// find relation for this fk and collection
			const manySideExist = this.relations.some(
				(rel) => rel.fkName === fk.fkName && rel.tableName === manyCollection.tableName,
			)

			// create relation if it does not exist
			if (!manySideExist) {
				const propertyName = this.getFreePropertyName({
					propertyName: camel(fk.referencedTable),
					tableName: fk.fkTable,
				})

				missingRelations.push(
					zodCreate(RelationMetadataSchema, {
						propertyName,
						fkName: fk.fkName,
						mtmFkName: null,
						label: title(fk.referencedTable),
						template: null,
						tableName: fk.fkTable,
					}),
				)
			}

			// one side (side where pk is located)
			if (!fk.referencedTable.startsWith("zmaj")) {
				// find collection
				const oneCollection = this.collections.find((col) => col.tableName === fk.referencedTable)
				if (!oneCollection) throw500(5478922)

				// find relation for this fk and collection
				const oneSideExist = this.relations.some(
					(rel) => rel.fkName === fk.fkName && rel.tableName === oneCollection.tableName,
				)

				// create relation if it does not exist
				if (!oneSideExist) {
					const propertyName = this.getFreePropertyName({
						propertyName: camel(fk.fkTable),
						tableName: fk.referencedTable,
					})
					missingRelations.push(
						zodCreate(RelationMetadataSchema, {
							propertyName,
							fkName: fk.fkName,
							mtmFkName: null,
							label: title(fk.fkTable),
							template: null,
							tableName: fk.referencedTable,
						}),
					)
				}
			}
		}

		if (missingRelations.length === 0) return

		for (const rel of missingRelations) {
			this.logger.log(`Creating missing relation ${rel.tableName}.${rel.propertyName}`)
		}

		try {
			await this.repo.createMany({ data: missingRelations })
		} catch (error) {
			this.logger.error(
				`Problem inserting missing relations: ${missingRelations
					.map((f) => `${f.tableName}__${f.fkName}`)
					.join(", ")}`,
			)
			throw500(628892)
		}

		await this.onChange()
	}

	/** Prevent relations from having duplicate property names or same property name as field */
	private async fixNamingCollisions(): Promise<void> {
		for (const rel of this.relations) {
			// value is free if it's not included in fields and relations
			const freePropertyName = this.getFreePropertyName(rel)

			if (freePropertyName === rel.propertyName) continue

			this.logger.log(`Fixing relation naming collision: ${rel.tableName}.${rel.propertyName}`)

			await this.repo.updateById({ id: rel.id, changes: { propertyName: freePropertyName } })

			// we have to update relations after every change
			await this.onChange()
		}
		//
	}

	/**
	 * Ensure that many to many relations are valid
	 *
	 * This check if many to many fks are valid, and that they are in same table
	 * We don't have to worry about FK since they are checked in previous methods.
	 * One relation can be many to many, while other can be one to many
	 */
	private async splitInvalidManyToMany(): Promise<void> {
		const toConvertIds = this.relations
			.filter((rel) => {
				// Only check this if it has m2m column
				if (!rel.mtmFkName) return false

				// first fk must be validated before this method
				const leftFk = this.fks.find((fk) => fk.fkName === rel.fkName) ?? throw500(4329)

				// we search for fk with mtmFkName and it must be in the same table where first FK is
				// located. If it does not exist, that means that they can't form MTM connection
				const mtmFk = this.fks.some(
					(fk) => fk.fkName === rel.mtmFkName && fk.fkTable === leftFk.fkTable,
				)

				// return true if fk does not exist
				return !mtmFk
			})
			// get only ids
			.map((rel) => rel.id)

		if (toConvertIds.length === 0) return

		await this.repo.updateWhere({
			where: { id: { $in: toConvertIds } },
			changes: { mtmFkName: null },
		})
		// await this.db
		// 	.start(RelationMetadataCollection)
		// 	.whereIn("id", toConvertIds)
		// 	.update({ mtm_fk_name: null })

		await this.onChange()
	}

	/**
	 * Should I do this. It's presumptuous of me to assume if relation is m2m just because of the structure
	 * Maybe add a flag to do this only on first boot?
	 * I do not want to force to use m2m when in some case it's 2 m2o,
	 */
	private async WIP_createMissingM2M(): Promise<void> {
		const uniqueGroups = await this.schemaInfo.getCompositeUniqueKeys()

		for (const unique of uniqueGroups) {
			const [col1, col2] = unique.columnNames

			const leftFk = this.fks.find((fk) => fk.fkTable === unique.tableName && fk.fkColumn && col1)
			const rightFk = this.fks.find((fk) => fk.fkTable === unique.tableName && fk.fkColumn && col2)
			// both columns must have foreign keys and composite unique so we can be know that it's relation
			if (!leftFk || !rightFk) continue

			// we get collections where fk points to
			const leftCollection = this.collections.find((c) => c.tableName === leftFk.referencedTable)
			const rightCollection = this.collections.find((c) => c.tableName === rightFk.referencedTable)

			// if collection exists (not system table)
			if (leftCollection) {
				// we search for relevant relation, but where mtmFkName is null
				const relation = this.relations.find(
					(r) =>
						// r.collectionId === leftCollection.id &&
						r.tableName === leftCollection.tableName &&
						r.fkName === leftFk.fkName &&
						r.mtmFkName === null,
				)

				// if there is relation that isn't joined
				if (relation) {
					await this.repo.updateById({ id: relation.id, changes: { mtmFkName: rightFk.fkName } })
					// await this.db
					// 	.start(RelationMetadataCollection)
					// 	.where("id", relation.id)
					// 	.update({ mtm_fk_name: rightFk.fkName })
				}
			}

			// if collection exists (not system table)
			if (rightCollection) {
				// we search for relevant relation, but where mtmFkName is null
				const relation = this.relations.find(
					(r) =>
						// r.collectionId === rightCollection.id &&
						r.tableName === rightCollection.tableName &&
						r.fkName === rightFk.fkName &&
						r.mtmFkName === null,
				)
				// if there is relation that isn't joined
				if (relation) {
					await this.repo.updateById({ id: relation.id, changes: { mtmFkName: leftFk.fkName } })
					// await this.db
					// 	.start(RelationMetadataCollection)
					// 	.where("id", relation.id)
					// 	.update({ mtm_fk_name: leftFk.fkName })
				}
			}
		}

		await this.onChange()
	}
}
