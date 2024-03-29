import { throw400, throw403, throw404 } from "@api/common/throw-http"
import { emsg } from "@api/errors"
import { Injectable } from "@nestjs/common"
import {
	FieldCreateDto,
	FieldMetadata,
	FieldMetadataModel,
	FieldMetadataSchema,
	FieldUpdateDto,
	UUID,
	getFreeValue,
	isBoolean,
	isNil,
	zodCreate,
} from "@zmaj-js/common"
import { AlterSchemaService, Orm, OrmRepository } from "@zmaj-js/orm"
import { isString, title } from "radash"
import { InfraStateService } from "../infra-state/infra-state.service"
import { InfraConfig } from "../infra.config"
import { OnInfraChangeService } from "../on-infra-change.service"

@Injectable()
export class FieldsService {
	constructor(
		private readonly orm: Orm,
		private readonly infraState: InfraStateService,
		private readonly appInfraSync: OnInfraChangeService,
		private readonly alterSchema: AlterSchemaService,
		private readonly config: InfraConfig,
	) {
		this.repo = this.orm.getRepo(FieldMetadataModel)
	}

	readonly repo: OrmRepository<FieldMetadataModel>

	async createField(data: FieldCreateDto): Promise<FieldMetadata> {
		const collection =
			this.infraState.getCollection(data.collectionName) ?? throw400(48932, emsg.noCollection)

		if (Object.values(collection.fields).some((f) => f.columnName === data.columnName)) {
			throw400(32912, emsg.columnExists(data.columnName))
		}

		// if provided, always use provided value, let it error. If not get first free value
		const fieldName =
			data.fieldName ??
			getFreeValue(
				data.columnName,
				(name) =>
					collection.fields[name] === undefined && //
					collection.relations[name] === undefined,
				{ case: this.config.defaultCase },
			)

		const toCreate = zodCreate(FieldMetadataSchema.omit({ createdAt: true }), {
			...data,
			label: data.label ?? title(data.columnName),
			description: data.description,
			tableName: collection.tableName,
			fieldName,
		})

		return this.appInfraSync.executeChange(async () =>
			this.orm.transaction({
				fn: async (trx) => {
					const field = await this.repo.createOne({ data: toCreate, trx: trx })

					await this.alterSchema.createColumn({
						tableName: collection.tableName,
						defaultValue: this.getDefaultValue(data.dbDefaultValue),
						columnName: data.columnName,
						nullable: data.isNullable,
						dataType: { type: "general", value: data.dataType },
						unique: data.isUnique,
						trx,
					})

					return field
				},
			}),
		)
	}

	// async checkIfColumnCanBeNotNull(tableName: string, isNullable: boolean) {
	// 	const hasRows = await this.repoManager.getRepo(tableName).count({})
	// 	if (hasRows && !isNullable) {
	// 		throw403(4324234, emsg.noDefaultValue)
	// 	}
	// }

	async updateField(id: string, changes: FieldUpdateDto): Promise<FieldMetadata> {
		const currentField =
			this.infraState.fields.find((f) => f.id === id) ?? throw400(42399, emsg.noField)

		return this.appInfraSync.executeChange(async () => {
			if (
				isBoolean(changes.isUnique) ||
				isBoolean(changes.isUnique) ||
				changes.dbDefaultValue !== undefined
			) {
				await this.alterSchema.updateColumn({
					columnName: currentField.columnName,
					tableName: currentField.tableName,
					defaultValue:
						changes.dbDefaultValue !== undefined
							? this.getDefaultValue(changes.dbDefaultValue)
							: undefined,
					nullable: changes.isNullable ?? undefined,
					unique: changes.isUnique ?? undefined,
				})
			}
			const field = await this.repo.updateById({ id, changes })

			return field
		})
	}

	async deleteField(id: UUID): Promise<FieldMetadata> {
		const fieldInState =
			this.infraState.fields.find((f) => f.id === id) ?? throw404(37923, emsg.noField)
		if (fieldInState.isPrimaryKey) throw403(97778, emsg.noDeletePk)
		// require to delete relation first
		if (fieldInState.isForeignKey) throw403(79777, emsg.noDeleteFk)

		return this.appInfraSync.executeChange(async () =>
			this.orm.transaction({
				fn: async (trx) => {
					const field = await this.repo.deleteById({ id, trx })

					await this.alterSchema.dropColumn({
						columnName: field.columnName,
						tableName: fieldInState.tableName,
						trx,
					})

					return field
				},
			}),
		)
	}

	/**
	 * I'm allowing raw values because only admin can change database, so unsafe input is ok
	 */
	private getDefaultValue(
		value?: string | null | unknown,
	): Parameters<AlterSchemaService["createColumn"]>[0]["defaultValue"] {
		if (isNil(value)) return null
		// do nothing for numbers...
		if (!isString(value)) return { type: "normal", value: JSON.stringify(value) }
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
