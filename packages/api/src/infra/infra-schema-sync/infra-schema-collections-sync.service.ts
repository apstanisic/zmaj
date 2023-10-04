import { BootstrapOrm } from "@api/database/BootstrapRepoManager"
import { InfraService } from "@api/infra/infra.service"
import { Injectable, Logger } from "@nestjs/common"
import {
	CollectionMetadata,
	CollectionMetadataModel,
	CollectionMetadataSchema,
	getFreeValue,
	zodCreate,
} from "@zmaj-js/common"
import { OrmRepository, SchemaInfoService } from "@zmaj-js/orm"
import { InfraConfig } from "../infra.config"

@Injectable()
export class InfraSchemaCollectionsSyncService {
	logger = new Logger(InfraSchemaCollectionsSyncService.name)
	constructor(
		private infraService: InfraService,
		private schemaInfo: SchemaInfoService,
		private orm: BootstrapOrm,
		private config: InfraConfig,
	) {
		this.repo = this.orm.getRepo(CollectionMetadataModel)
	}
	repo: OrmRepository<CollectionMetadataModel>

	/**
	 * Sync fields and collection with database columns and tables
	 * Remove goes first, especially for relations, since m2m can be transformed to m2o
	 * if one FK is deleted
	 */
	async sync(): Promise<void> {
		const collections = await this.infraService.getCollectionMetadata()
		const tables = await this.schemaInfo.getTableNames()
		await this.removeRedundantCollections(tables, collections)
		await this.addMissingCollections(tables, collections)
	}

	/**
	 * Ensure that there is no collection metadata for non existing table
	 */
	private async removeRedundantCollections(
		tables: string[],
		collections: CollectionMetadata[],
	): Promise<void> {
		const redundantCollections = collections.filter((col) => !tables.includes(col.tableName))
		if (redundantCollections.length === 0) return

		for (const col of redundantCollections) {
			this.logger.log(`Deleting redundant collection for table "${col.tableName}"`)
		}

		await this.repo.deleteWhere({
			where: { id: { $in: redundantCollections.map((c) => c.id) } },
		})
	}

	/**
	 * Ensure that every table has collection metadata
	 */
	private async addMissingCollections(
		tables: string[],
		collections: CollectionMetadata[],
	): Promise<void> {
		const missing = tables
			// not system table
			.filter((table) => !table.startsWith("zmaj"))
			// there is no collection info with table name
			.filter((table) => !collections.some((col) => col.tableName === table))
			// create object
			.map((tableName) => {
				const collectionName = getFreeValue(
					tableName, // is free if every collection does not have that name
					(v) => collections.every((c) => c.collectionName !== v),
					{ case: this.config.defaultCase },
				)
				return zodCreate(CollectionMetadataSchema.omit({ createdAt: true }), {
					tableName,
					collectionName,
				})
			})

		if (missing.length === 0) return

		for (const col of missing) {
			this.logger.log(`Creating missing collection for table "${col.tableName}"`)
		}

		await this.repo.createMany({ data: missing })
	}
}
