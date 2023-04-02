import { throw500 } from "@api/common/throw-http"
import { BootstrapRepoManager } from "@api/database/orm-specs/BootstrapRepoManager"
import { OrmRepository } from "@api/database/orm-specs/OrmRepository"
import { SchemaInfoService } from "@api/database/schema/schema-info.service"
import { InfraService } from "@api/infra/infra.service"
import { Injectable, Logger } from "@nestjs/common"
import {
	RelationDef,
	RelationMetadata,
	RelationMetadataCollection,
	RelationMetadataSchema,
	getFreeValue,
	zodCreate,
} from "@zmaj-js/common"
import { title, unique } from "radash"
import { InitialDbState } from "../infra-state/InitialDbState"

type DbState = Pick<
	InitialDbState,
	"fieldMetadata" | "collectionMetadata" | "relationMetadata" | "fks"
>
/**
 * Sync relations with FKs. This ensures that relations are valid, and can freely be used
 * inside the system without worrying if they're out of sync
 */
@Injectable()
export class InfraSchemaRelationsSyncService {
	private logger = new Logger(InfraSchemaRelationsSyncService.name)

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
		const state = await this.getFreshState()

		const invalid = await this.removeInvalidRelations(state)
		const invalidIds = invalid.map((rel) => rel.id)
		state.relationMetadata = state.relationMetadata.filter((r) => !invalidIds.includes(r.id))

		const created = await this.createMissingRelations(state)
		state.relationMetadata = [...state.relationMetadata, ...created]

		const splitted = await this.splitInvalidManyToMany(state)
		// first unique value is kept
		state.relationMetadata = unique([...splitted, ...state.relationMetadata], (r) => r.id)

		await this.fixNamingCollisions(state)
	}

	async getFreshState(): Promise<DbState> {
		return {
			fieldMetadata: await this.infraService.getFieldMetadata(),
			collectionMetadata: await this.infraService.getCollectionMetadata(),
			relationMetadata: await this.infraService.getRelationMetadata(),
			fks: await this.infraService.getForeignKeys(),
		}
	}

	async refreshRelations(): Promise<RelationMetadata[]> {
		return this.infraService.getRelationMetadata()
	}

	/** Remove relations without corresponding foreign key */
	private async removeInvalidRelations(data: DbState): Promise<RelationMetadata[]> {
		const invalidRelations: RelationMetadata[] = []
		for (const relation of data.relationMetadata) {
			// should always exist, since it's based on fk
			// system relation are not in db so it's safe
			const collection =
				data.collectionMetadata.find((col) => col.tableName === relation.tableName) ??
				throw500(78324329)

			// relation must contain fk
			// collection table must be in this fk, and name must match
			const relevantFkExist = data.fks.some(
				(fk) =>
					fk.fkName === relation.fkName &&
					[fk.fkTable, fk.referencedTable].includes(collection.tableName),
			)
			if (!relevantFkExist) {
				this.logger.log(`Removing invalid relation ${relation.tableName}.${relation.propertyName}`)
				invalidRelations.push(relation)
			}
		}

		if (invalidRelations.length === 0) return []

		// remove invalid relations
		// await this.db.start(RelationMetadataCollection).whereIn("id", invalidIds).del()
		await this.repo.deleteWhere({ where: { id: { $in: invalidRelations.map((r) => r.id) } } })
		// await this.db.start(RelationMetadataCollection).whereIn("id", invalidRelationIds).del()

		return invalidRelations
	}

	/**
	 * This will get first free property name. If relation id is provided, method will
	 * compare propertyName with itself
	 */
	getFreePropertyName(
		relation: Pick<RelationDef, "tableName" | "propertyName"> & Partial<Pick<RelationDef, "id">>,
		data: DbState,
	): string {
		// fields in collection that current relation is located
		const fieldsPropertyNames = data.fieldMetadata
			.filter((f) => f.tableName === relation.tableName)
			.map((f) => f.fieldName)

		// relations in same collection
		const relationsPropertyNames = data.relationMetadata
			// don't compare with itself
			.filter((r) => r.tableName === relation.tableName && r.id !== relation.id)
			.map((r) => r.propertyName)

		const takenPropertyNames = [...fieldsPropertyNames, ...relationsPropertyNames]

		// value is free if it's not included in fields and relations
		const freePropertyName = getFreeValue(
			relation.propertyName,
			(val) => !takenPropertyNames.includes(val),
			// use camel always for now, since this is not tied to db.
			// case initial value only if relation is not persisted in db (does not hav id)
			{ case: "camel", caseInitial: relation.id === undefined },
		)
		return freePropertyName
	}
	/**
	 * Create missing relations
	 *
	 * Foreign key exists, but not relation metadata in db
	 * It will always create m2o-o2m combo, never m2m
	 */
	private async createMissingRelations(data: DbState): Promise<RelationMetadata[]> {
		const missingRelations: RelationMetadata[] = []

		for (const fk of data.fks) {
			// many side (side where fk is located)
			if (fk.fkTable.startsWith("zmaj")) continue
			// no support for self referencing fk, for now
			if (fk.fkTable === fk.referencedTable) continue
			// find collection
			const manyCollection = data.collectionMetadata.find((col) => col.tableName === fk.fkTable)
			if (!manyCollection) throw500(471024)

			// find relation for this fk and collection
			const manySideExist = data.relationMetadata.some(
				(rel) => rel.fkName === fk.fkName && rel.tableName === manyCollection.tableName,
			)

			// create relation if it does not exist
			if (!manySideExist) {
				const propertyName = this.getFreePropertyName(
					{ propertyName: fk.referencedTable, tableName: fk.fkTable },
					data,
				)

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
				const oneCollection = data.collectionMetadata.find(
					(col) => col.tableName === fk.referencedTable,
				)
				if (!oneCollection) throw500(5478922)

				// find relation for this fk and collection
				const oneSideExist = data.relationMetadata.some(
					(rel) => rel.fkName === fk.fkName && rel.tableName === oneCollection.tableName,
				)

				// create relation if it does not exist
				if (!oneSideExist) {
					const propertyName = this.getFreePropertyName(
						{
							propertyName: fk.fkTable,
							tableName: fk.referencedTable,
						},
						data,
					)
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

		if (missingRelations.length === 0) return []

		for (const rel of missingRelations) {
			this.logger.log(`Creating missing relation ${rel.tableName}.${rel.propertyName}`)
		}

		try {
			const created = await this.repo.createMany({ data: missingRelations })
			return created
		} catch (error) {
			this.logger.error(
				`Problem inserting missing relations: ${missingRelations
					.map((f) => `${f.tableName}__${f.fkName}`)
					.join(", ")}`,
			)
			throw500(628892)
		}
	}

	/** Prevent relations from having duplicate property names or same property name as field */
	private async fixNamingCollisions(data: DbState): Promise<void> {
		// clone this since we will mutate relations
		const relations = structuredClone(data.relationMetadata)
		for (const rel of relations) {
			// value is free if it's not included in fields and relations
			const freePropertyName = this.getFreePropertyName(rel, {
				...data,
				relationMetadata: relations, // we must send mutated values
			})

			if (freePropertyName === rel.propertyName) continue

			this.logger.log(`Fixing relation naming collision: ${rel.tableName}.${rel.propertyName}`)

			// This will mutate relation, so that we don't have to fresh new data from db
			// If we don't do this, rel will have stale value, and some comparison will not work
			// This is cheaper, than to fetch fresh db relations on every change
			rel.propertyName = freePropertyName
			await this.repo.updateById({ id: rel.id, changes: { propertyName: freePropertyName } })
		}
	}

	/**
	 * Ensure that many to many relations are valid
	 *
	 * This check if many to many fks are valid, and that they are in same table
	 * We don't have to worry about FK since they are checked in previous methods.
	 * One relation can be many to many, while other can be one to many
	 */
	private async splitInvalidManyToMany(data: DbState): Promise<RelationMetadata[]> {
		const toStripMtmRelations: RelationMetadata[] = []
		for (const relation of data.relationMetadata) {
			if (relation.mtmFkName === null) continue

			// first fk must be validated before this method
			const leftFk = data.fks.find((fk) => fk.fkName === relation.fkName) ?? throw500(4329)

			// we search for fk with mtmFkName and it must be in the same table where first FK is
			// located. If it does not exist, that means that they can't form MTM connection
			const mtmFk = data.fks.some(
				(fk) => fk.fkName === relation.mtmFkName && fk.fkTable === leftFk.fkTable,
			)
			// We only check for fk, not for other relation, since m2m can be one sided (we don't add relation to system tables)
			if (!mtmFk) toStripMtmRelations.push(relation)
		}

		if (toStripMtmRelations.length === 0) return []

		return this.repo.updateWhere({
			where: { id: { $in: toStripMtmRelations.map((r) => r.id) } },
			changes: { mtmFkName: null },
		})
		// await this.db
		// 	.start(RelationMetadataCollection)
		// 	.whereIn("id", toConvertIds)
		// 	.update({ mtm_fk_name: null })

		// await this.onChange()
	}

	/**
	 * Should I do this. It's presumptuous of me to assume if relation is m2m just because of the structure
	 * Maybe add a flag to do this only on first boot?
	 * I do not want to force to use m2m when in some case it's 2 m2o,
	 */
	private async WIP_createMissingM2M(data: DbState): Promise<void> {
		const uniqueGroups = await this.schemaInfo.getCompositeUniqueKeys()

		for (const unique of uniqueGroups) {
			const [col1, col2] = unique.columnNames

			const leftFk = data.fks.find((fk) => fk.fkTable === unique.tableName && fk.fkColumn && col1)
			const rightFk = data.fks.find((fk) => fk.fkTable === unique.tableName && fk.fkColumn && col2)
			// both columns must have foreign keys and composite unique so we can be know that it's relation
			if (!leftFk || !rightFk) continue

			// we get collections where fk points to
			const leftCollection = data.collectionMetadata.find(
				(c) => c.tableName === leftFk.referencedTable,
			)
			const rightCollection = data.collectionMetadata.find(
				(c) => c.tableName === rightFk.referencedTable,
			)

			// if collection exists (not system table)
			if (leftCollection) {
				// we search for relevant relation, but where mtmFkName is null
				const relation = data.relationMetadata.find(
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
				const relation = data.relationMetadata.find(
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
	}
}
