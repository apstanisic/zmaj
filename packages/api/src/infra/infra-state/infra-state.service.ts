import { throw500 } from "@api/common/throw-http"
import { BootstrapRepoManager } from "@api/database/orm-specs/BootstrapRepoManager"
import { SchemaInfoService } from "@api/database/schema/schema-info.service"
import { InfraService } from "@api/infra/infra.service"
import { Injectable, Logger } from "@nestjs/common"
import {
	CollectionDef,
	CollectionMetadata,
	FieldConfigSchema,
	FieldDef,
	FieldMetadata,
	LayoutConfigSchema,
	RelationDef,
	RelationMetadata,
	Struct,
	UUID,
	getColumnType,
	isStruct,
	isUUID,
	nestByTableAndColumnName,
	notNil,
	systemCollections,
} from "@zmaj-js/common"
import { objectify } from "radash"
import { ExpandRelationsService } from "./expand-relations.service"
import { InitialDbState } from "./InitialDbState"

/**
 * Keep all needed infra info in memory, so we can access it quickly
 */
@Injectable()
export class InfraStateService {
	logger = new Logger(InfraStateService.name)
	/** Track current version. Used for cache */
	version = Date.now()

	/**
	 * Expanded collections, both system and non system
	 * Key collection name, value is collection
	 */
	private _collections: Struct<CollectionDef> = {}

	constructor(
		private readonly schemaInfo: SchemaInfoService,
		private readonly infra: InfraService,
		private readonly bootRepo: BootstrapRepoManager,
		private expandRelationsService: ExpandRelationsService = new ExpandRelationsService(),
	) {}

	/** Fields */
	get fields(): Readonly<FieldDef[]> {
		return Object.values(this.collections).flatMap((c) => Object.values(c.fields))
	}

	/** Relations */
	get relations(): Readonly<RelationDef[]> {
		return Object.values(this.collections).flatMap((c) => Object.values(c.relations))
	}

	/** Collections */
	get collections(): Struct<CollectionDef> {
		return this._collections
	}

	/**
	 * Get collection from state
	 *
	 * Useful since user can throw either infra collection, collection id, table name, and collection name
	 * and get full collection from state
	 *
	 * @param collection Collection that user wants
	 * @returns Collection if exists, `undefined` otherwise
	 */
	getCollection(
		collection: UUID | string | CollectionMetadata | CollectionDef,
	): CollectionDef | undefined {
		if (isStruct(collection)) {
			return this._collections[collection.collectionName]
		} else if (isUUID(collection)) {
			return Object.values(this._collections).find((c) => c.id === collection)
		} else {
			return this._collections[collection]
		}
	}

	private async getDbState(): Promise<InitialDbState> {
		const result = await this.bootRepo
			.transaction({
				fn: async (trx): Promise<InitialDbState> => {
					// db schema
					const columns = nestByTableAndColumnName(await this.schemaInfo.getColumns({ trx }))
					const fks = await this.infra.getForeignKeys(trx)

					const compositeUniqueKeys = await this.schemaInfo.getCompositeUniqueKeys({ trx })

					// Get simple db values
					const collectionMetadata = await this.infra.getCollectionMetadata(trx)
					const fieldMetadata = await this.infra.getFieldMetadata(trx)
					const relationMetadata = await this.infra.getRelationMetadata(trx)
					return {
						collectionMetadata,
						columns,
						compositeUniqueKeys,
						fieldMetadata,
						fks,
						relationMetadata,
					}
				},
			})
			.catch((error) => {
				this.logger.error("DB Problem", error)
				throw error
			})
		return result
	}

	async initializeState(): Promise<void> {
		this.version = Date.now()

		const dbState = await this.getDbState()

		// Expand Fields
		const fields = dbState.fieldMetadata.map((field) => this.expandField(field, dbState))

		// Expand relations
		const relations = dbState.relationMetadata.map((relation) =>
			this.expandRelation(relation, dbState),
		)

		// Expand collections
		const userCollections = dbState.collectionMetadata
			.map((collection) => this.expandCollection(collection, fields, relations))
			// don't use without pk
			.filter(notNil)

		const allCollections = [...userCollections, ...systemCollections]

		// remove this object before settings values again
		this._collections = {}
		for (const col of allCollections) {
			this._collections[col.collectionName] = col
		}
	}

	private expandField(field: FieldMetadata, dbState: InitialDbState): FieldDef {
		const collection = dbState.collectionMetadata.find((c) => c.tableName === field.tableName)
		const column = dbState.columns[field.tableName]?.[field.columnName]

		if (!collection) throw500(979852)
		if (!column) throw500(710023)

		const isForeignKey = dbState.fks.some(
			(fk) => fk.fkTable === column.tableName && fk.fkColumn === column.tableName,
		)

		return {
			...field,
			// collectionId: collection.id,
			collectionName: collection.collectionName,
			dataType: getColumnType(column.dataType),
			dbRawDataType: column.dataType,
			dbDefaultValue: column.defaultValue,
			isNullable: column.nullable,
			isPrimaryKey: column.primaryKey,
			isUnique: column.unique,
			isAutoIncrement: column.autoIncrement,
			isForeignKey,
			// column.foreignKey !== undefined,
			hasDefaultValue: column.defaultValue !== null,
			fieldConfig: FieldConfigSchema.parse(field.fieldConfig),
		}
	}

	private expandRelation(relation: RelationMetadata, dbState: InitialDbState): RelationDef {
		return this.expandRelationsService.expand(relation, {
			fks: dbState.fks,
			compositeUniqueKeys: dbState.compositeUniqueKeys,
			collections: [...dbState.collectionMetadata, ...systemCollections],
			allRelations: [
				...dbState.relationMetadata,
				...systemCollections.flatMap((c) => Object.values(c.relations).map((v) => v.relation)),
			],
		})
		//
	}

	private expandCollection(
		collection: CollectionMetadata,
		allFields: FieldDef[],
		allRelations: RelationDef[],
	): CollectionDef | undefined {
		const fields = allFields.filter((f) => f.tableName === collection.tableName)
		const relations = allRelations.filter((rel) => rel.tableName === collection.tableName)

		const pkField = fields.find((f) => f.isPrimaryKey)
		// ignore collection if not pk
		if (!pkField) return undefined

		const isJunctionTable = allRelations.some(
			(r) => r.type === "many-to-many" && r.junction.tableName === collection.tableName,
		)

		return {
			...collection,
			definedInCode: false,
			pkType: pkField.isAutoIncrement ? "auto-increment" : "uuid",
			pkColumn: pkField.columnName,
			pkField: pkField.fieldName,
			isJunctionTable: isJunctionTable,
			authzKey: `collections.${collection.collectionName}`,
			fields: objectify(fields, (f) => f.fieldName),
			relations: objectify(relations, (r) => r.propertyName),
			layoutConfig: LayoutConfigSchema.parse(collection.layoutConfig),
		}
	}
}
