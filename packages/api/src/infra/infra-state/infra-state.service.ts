import { throw500 } from "@api/common/throw-http"
import { BootstrapRepoManager } from "@api/database/orm-specs/BootstrapRepoManager"
import { SchemaInfoService } from "@api/database/schema/schema-info.service"
import { InfraService } from "@api/infra/infra.service"
import { Injectable, Logger } from "@nestjs/common"
import {
	CollectionDef,
	CollectionMetadata,
	CompositeUniqueKey,
	DbColumn,
	FieldConfigSchema,
	FieldDef,
	FieldMetadata,
	ForeignKey,
	LayoutConfigSchema,
	RelationDef,
	RelationMetadata,
	Struct,
	UUID,
	getColumnType,
	isStruct,
	isUUID,
	notNil,
	systemCollections,
} from "@zmaj-js/common"
import { ExpandRelationsService } from "./expand-relations.service"
import { group, mapValues, objectify } from "radash"

/**
 * Keep all needed infra info in memory, so we can access it quickly
 */
@Injectable()
export class InfraStateService {
	logger = new Logger(InfraStateService.name)
	/** Track current version. Used for cache */
	version = Date.now()

	/** DB schema columns */
	private _columns: Struct<Struct<DbColumn>> = {}

	/** DB foreign keys */
	private _fks: readonly ForeignKey[] = []
	/** Composite unique keys (used for m2m) */
	private _compositeUniqueKeys: readonly CompositeUniqueKey[] = []

	/** Collections in DB */
	private _dbCollections: readonly CollectionMetadata[] = []

	/** Fields in DB */
	private _dbFields: readonly FieldMetadata[] = []

	/** Relations in DB */
	private _dbRelations: readonly RelationMetadata[] = []

	/** Expanded DB fields */
	private _fields: readonly FieldDef[] = []

	/** Expanded relations */
	private _relations: readonly RelationDef[] = []

	/** System collections */
	private readonly _systemCollections: readonly CollectionDef[] = structuredClone(systemCollections)

	/** Expanded DB collections */
	private _nonSystemCollections: readonly CollectionDef[] = []

	/**
	 * Expanded collections, both system and non system
	 * Key is camel case table, value is collection
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
		return this._fields
	}

	/** Relations */
	get relations(): Readonly<RelationDef[]> {
		return this._relations
	}

	/** Collections */
	get collections(): Struct<CollectionDef> {
		return this._collections
	}

	get fks(): readonly ForeignKey[] {
		return this._fks
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

	async setStateFromDb(): Promise<void> {
		await this.bootRepo
			.transaction({
				fn: async (trx) => {
					// db schema
					this._columns = nestColumns(await this.schemaInfo.getColumns({ trx }))
					this._fks = await this.schemaInfo.getForeignKeys({ trx })

					this._compositeUniqueKeys = await this.schemaInfo.getCompositeUniqueKeys({ trx })

					// Get simple db values
					this._dbCollections = await this.infra.getCollectionMetadata(trx)
					this._dbFields = await this.infra.getFieldMetadata(trx)
					this._dbRelations = await this.infra.getRelationMetadata(trx)
				},
			})
			.catch((e) => {
				this.logger.error("DB Problem", e)
			})
	}

	async initializeState(): Promise<void> {
		this.version = Date.now()

		await this.setStateFromDb()

		// Expand Fields
		this._fields = this._dbFields.map((field) => this.expandField(field))

		// Expand relations
		this._relations = this._dbRelations.map((relation) => this.expandRelation(relation))

		// Expand collections
		this._nonSystemCollections = this._dbCollections
			.map((collection) => this.expandCollection(collection))
			// don't use without pk
			.filter(notNil)

		const allCollections = [...this._nonSystemCollections, ...this._systemCollections]

		// remove this object before settings values again
		this._collections = {}
		for (const col of allCollections) {
			this._collections[col.collectionName] = col
		}
	}

	private expandField(field: FieldMetadata): FieldDef {
		const collection = this._dbCollections.find((c) => c.tableName === field.tableName)
		const column = this._columns[field.tableName]?.[field.columnName]

		if (!collection) throw500(979852)
		if (!column) throw500(710023)

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
			isForeignKey: this._fks.some(
				(fk) => fk.fkTable === column.tableName && fk.fkColumn === column.tableName,
			),
			// column.foreignKey !== undefined,
			hasDefaultValue: column.defaultValue !== null,
			fieldConfig: FieldConfigSchema.parse(field.fieldConfig),
		}
	}

	private expandRelation(relation: RelationMetadata): RelationDef {
		return this.expandRelationsService.expand(relation, {
			fks: this._fks,
			compositeUniqueKeys: this._compositeUniqueKeys,
			collections: [...this._dbCollections, ...this._systemCollections],
			allRelations: [
				...this._dbRelations,
				...this._systemCollections.flatMap((c) =>
					Object.values(c.relations).map((v) => v.relation),
				), //flatMap((c) => c.fullRelations),
			],
		})
		//
	}

	private expandCollection(collection: CollectionMetadata): CollectionDef | undefined {
		const pkColumn = Object.values(this._columns[collection.tableName] ?? {}).find(
			(col) => col.primaryKey,
		)
		// ignore collection if not pk
		if (!pkColumn) return undefined

		const isJunctionTable = this._relations.some(
			(r) => r.type === "many-to-many" && r.junction.tableName === collection.tableName,
		)

		const fields = this._fields.filter((f) => f.tableName === collection.tableName)
		const relations = this._relations.filter((rel) => rel.tableName === collection.tableName)

		const pkField = fields.find((f) => f.columnName === pkColumn.columnName) ?? throw500(983331)

		return {
			...collection,
			definedInCode: false,
			pkType: pkColumn.autoIncrement ? "auto-increment" : "uuid",
			pkColumn: pkColumn.columnName,
			pkField: pkField.fieldName,
			isJunctionTable: isJunctionTable,
			authzKey: `collections.${collection.collectionName}`,
			fields: Object.fromEntries(fields.map((f) => [f.fieldName, f])),
			relations: Object.fromEntries(relations.map((f) => [f.propertyName, f])),
			layoutConfig: LayoutConfigSchema.parse(collection.layoutConfig),
		}
	}
}

function nestColumns(columns: DbColumn[]): Struct<Struct<DbColumn>> {
	const groups = group(columns, (col) => col.tableName)
	return mapValues(groups, (colInOneTable) =>
		objectify(colInOneTable ?? [], (col) => col.columnName),
	)
}
