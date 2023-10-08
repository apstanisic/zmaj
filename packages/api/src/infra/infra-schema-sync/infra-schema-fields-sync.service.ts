import { throw500 } from "@api/common/throw-http"
import { BootstrapOrm } from "@api/database/BootstrapOrm"
import { InfraService } from "@api/infra/infra.service"
import { Injectable, Logger } from "@nestjs/common"
import {
	FieldMetadata,
	FieldMetadataModel,
	FieldMetadataSchema,
	getFreeValue,
	nestByTableAndColumnName,
	zodCreate,
} from "@zmaj-js/common"
import { DbColumn, GetCreateFields, OrmRepository, SchemaInfoService } from "@zmaj-js/orm"
import { title } from "radash"
import { InfraConfig } from "../infra.config"

/**
 * Sync field info with database
 */
@Injectable()
export class InfraSchemaFieldsSyncService {
	private logger = new Logger(InfraSchemaFieldsSyncService.name)
	constructor(
		private infraService: InfraService,
		private schemaInfo: SchemaInfoService,
		private orm: BootstrapOrm,
		private config: InfraConfig,
	) {
		this.repo = this.orm.getRepo(FieldMetadataModel)
	}
	repo: OrmRepository<FieldMetadataModel>

	/**
	 * It will be called after collection info is initialized
	 * Call after collections are initialized
	 */
	async sync(): Promise<void> {
		const columns = await this.schemaInfo.getColumns()
		const fields = await this.infraService.getFieldMetadata()

		await this.removeFieldsWithoutColumn(fields, columns)
		await this.addMissingFields(fields, columns)
	}

	/**
	 * Ensure that there is no field info for non existing column
	 */
	private async removeFieldsWithoutColumn(
		fields: FieldMetadata[],
		columns: DbColumn[],
	): Promise<void> {
		const nestedColumns = nestByTableAndColumnName(columns)
		// Return only fields that don't exist as column
		const redundant = fields.filter(
			(f) => nestedColumns[f.tableName]?.[f.columnName] === undefined,
		)

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
	private async addMissingFields(fields: FieldMetadata[], columns: DbColumn[]): Promise<void> {
		const missing: GetCreateFields<FieldMetadataModel, false>[] = []

		const nestedFields = nestByTableAndColumnName(fields)

		for (const column of columns) {
			if (column.tableName.startsWith("zmaj")) continue

			const fieldExist = nestedFields[column.tableName]?.[column.columnName]
			if (fieldExist) continue

			// free if there is no field with same field name and table name
			const fieldName = getFreeValue(
				column.columnName,
				(v) => !fields.some((f) => f.fieldName === v && f.tableName === column.tableName),
				{ case: this.config.defaultCase },
			)

			missing.push(
				zodCreate(FieldMetadataSchema.omit({ createdAt: true }), {
					columnName: column.columnName,
					canUpdate: !column.primaryKey,
					label: title(column.columnName),
					tableName: column.tableName,
					fieldName: fieldName,
				}),
			)
		}

		if (missing.length === 0) return

		for (const field of missing) {
			this.logger.log(
				`Creating missing field "${field.columnName}" for table "${field.tableName}"`,
			)
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
