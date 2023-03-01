import { throw400, throw403, throw404 } from "@api/common/throw-http"
import { OrmRepository } from "@api/database/orm-specs/OrmRepository"
import { RepoManager } from "@api/database/orm-specs/RepoManager"
import { CreateColumnSchema } from "@api/database/schema/alter-schema.schemas"
import { AlterSchemaService } from "@api/database/schema/alter-schema.service"
import { emsg } from "@api/errors"
import { Injectable } from "@nestjs/common"
import {
	FieldMetadata,
	FieldMetadataCollection,
	FieldCreateDto,
	FieldMetadataSchema,
	FieldUpdateDto,
	isNil,
	UUID,
	zodCreate,
} from "@zmaj-js/common"
import { camel, title } from "radash"
import { z } from "zod"
import { InfraStateService } from "../infra-state/infra-state.service"
import { OnInfraChangeService } from "../on-infra-change.service"

@Injectable()
export class FieldsService {
	constructor(
		private readonly repoManager: RepoManager,
		private readonly infraState: InfraStateService,
		private readonly appInfraSync: OnInfraChangeService,
		private readonly alterSchema: AlterSchemaService,
	) {
		this.repo = this.repoManager.getRepo(FieldMetadataCollection)
	}

	readonly repo: OrmRepository<FieldMetadata>

	async createField(data: FieldCreateDto): Promise<FieldMetadata> {
		const collection =
			this.infraState.getCollection(data.tableName) ?? throw400(48932, emsg.noCollection)

		if (collection.fields[camel(data.columnName)]) {
			throw400(32912, emsg.fieldExists(data.columnName))
		}

		const toCreate = zodCreate(FieldMetadataSchema, {
			...data,
			label: data.label ?? title(data.columnName),
			description: data.description,
			tableName: collection.tableName,
		})

		return this.appInfraSync.executeChange(async () =>
			this.repoManager.transaction({
				fn: async (trx) => {
					const field = await this.repo.createOne({ data: toCreate, trx: trx })

					await this.alterSchema.createColumn(
						{
							tableName: collection.tableName,
							defaultValue: this.getDefaultValue(data.dbDefaultValue),
							columnName: data.columnName,
							nullable: data.isNullable,
							dataType: { type: "general", value: data.dataType },
							unique: data.isUnique,
						},
						{ trx },
					)

					return field
				},
			}),
		)
	}

	async updateField(id: string, changes: FieldUpdateDto): Promise<FieldMetadata> {
		return this.appInfraSync.executeChange(async () => this.repo.updateById({ id, changes }))
	}

	async deleteField(id: UUID): Promise<FieldMetadata> {
		const fieldInState =
			this.infraState.fields.find((f) => f.id === id) ?? throw404(37923, emsg.noField)
		if (fieldInState.isPrimaryKey) throw403(97778, emsg.noDeletePk)
		// require to delete relation first
		if (fieldInState.isForeignKey) throw403(79777, emsg.noDeleteFk)

		return this.appInfraSync.executeChange(async () =>
			this.repoManager.transaction({
				fn: async (trx) => {
					const field = await this.repo.deleteById({ id, trx })

					await this.alterSchema.dropColumn(
						{ columnName: field.columnName, tableName: fieldInState.tableName },
						{ trx },
					)

					return field
				},
			}),
		)
	}

	/**
	 * I'm allowing raw values because only admin can change database, so unsafe input is ok
	 */
	private getDefaultValue(
		value?: string | null,
	): z.infer<typeof CreateColumnSchema>["defaultValue"] {
		if (isNil(value)) return null
		const parsed = special(value)
		if (parsed.special) return { type: "raw", value: parsed.value }
		return { type: "normal", value: parsed.value }
	}
}

/**
 * Check if value is special, so it can be passed raw to db
 * For example "$:NOW()", will be converted to "NOW()" function, not to "NOW()" string
 */
function special(
	value: string,
	prefix = "$:",
	escapePrefix = "$",
): { value: string; special: boolean } {
	const escaped = prefix + escapePrefix
	if (value.startsWith(escaped)) return { value: value.replace(escapePrefix, ""), special: false }

	if (!value.startsWith(prefix)) return { value: value, special: false }

	return { value: value.replace(prefix, ""), special: true }
}
