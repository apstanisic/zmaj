import { throw500 } from "@api/common/throw-http"
import { BootstrapRepoManager } from "@api/database/orm-specs/BootstrapRepoManager"
import { OrmRepository } from "@api/database/orm-specs/OrmRepository"
import { SchemaInfoService } from "@api/database/schema/schema-info.service"
import { InfraService } from "@api/infra/infra.service"
import { Injectable, Logger } from "@nestjs/common"
import {
	FieldMetadata,
	FieldMetadataCollection,
	FieldMetadataSchema,
	getFreeValue,
	zodCreate,
} from "@zmaj-js/common"
import { camel, title } from "radash"

/**
 * Sync field info with database
 */
@Injectable()
export class InfraSchemaFieldsSyncService {
	private logger = new Logger(InfraSchemaFieldsSyncService.name)
	constructor(
		private infraService: InfraService,
		private schemaInfo: SchemaInfoService,
		private bootstrapRepoManager: BootstrapRepoManager,
	) {
		this.repo = this.bootstrapRepoManager.getRepo(FieldMetadataCollection)
	}
	repo: OrmRepository<FieldMetadata>

	/**
	 * It will be called after collection info is initialized
	 * Call after collections are initialized
	 */
	async sync(): Promise<void> {
		await this.removeFieldsWithoutColumn()
		await this.addMissingFields()
	}

	/**
	 * Ensure that there is no field info for non existing column
	 */
	private async removeFieldsWithoutColumn(): Promise<void> {
		const columns = await this.schemaInfo.getColumns()
		const fields = await this.infraService.getFieldMetadata()

		// Return only fields that don't exist as column
		const redundant = fields.filter((field) => {
			return !columns.some(
				(c) =>
					c.tableName === field.tableName && //
					c.columnName === field.columnName,
			)
		})
		// .map((f) => f.id)

		if (redundant.length === 0) return

		for (const field of redundant) {
			this.logger.log(
				`Removing redundant field "${field.columnName}" in table "${field.tableName}"`,
			)
		}

		try {
			await this.repo.deleteWhere({ where: { id: { $in: redundant.map((f) => f.id) } } })
		} catch (error) {
			this.logger.error(
				`Problem deleting redundant fields:${redundant
					.map((r) => `${r.tableName}__${r.columnName}`)
					.join(", ")}`,
			)
			throw500(6823494)
		}
	}

	/**
	 * Ensure that every column has field metadata
	 */
	private async addMissingFields(): Promise<void> {
		const fields = await this.infraService.getFieldMetadata()
		const systemAndUserColumns = await this.schemaInfo.getColumns()
		const columns = systemAndUserColumns.filter((col) => !col.tableName.startsWith("zmaj"))

		const missing: FieldMetadata[] = []

		for (const column of columns) {
			const fieldExist = fields.some(
				(f) =>
					f.tableName === column.tableName && //
					f.columnName === column.columnName,
			)

			if (fieldExist) continue

			const fieldName = getFreeValue(
				camel(column.columnName), // free if there is no field with same field name and table name
				(v) => !fields.some((f) => f.fieldName === v && f.tableName === column.tableName),
			)

			missing.push(
				zodCreate(FieldMetadataSchema, {
					columnName: column.columnName,
					canUpdate: !column.primaryKey,
					// collectionId: collection.id,
					label: title(column.columnName),
					tableName: column.tableName,
					fieldName: fieldName,
				}),
			)
		}

		if (missing.length === 0) return

		for (const field of missing) {
			this.logger.log(`Creating missing field "${field.columnName}" for table "${field.tableName}"`)
		}
		try {
			await this.repo.createMany({ data: missing })
		} catch (error) {
			this.logger.error(
				`Problem inserting missing fields: ${JSON.stringify(
					missing.map((f) => `${f.tableName}__${f.columnName}`).join(", "),
				)}`,
			)
			throw500(6823497669)
		}
	}
}
