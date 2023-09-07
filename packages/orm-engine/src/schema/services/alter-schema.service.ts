import {
	CreateColumnParams,
	CreateForeignKeyParams,
	CreateTableParams,
	CreateUniqueKeyParams,
	DropColumnParams,
	DropForeignKeyParams,
	DropTableParams,
	DropUniqueKeyParams,
	UpdateColumnParams,
} from "../types/alter-schema-params.types"

export abstract class AlterSchemaService {
	abstract createTable(params: CreateTableParams): Promise<void>

	abstract dropTable(params: DropTableParams): Promise<void>

	abstract createColumn(params: CreateColumnParams): Promise<void>
	abstract updateColumn(params: UpdateColumnParams): Promise<void>

	abstract dropColumn(params: DropColumnParams): Promise<void>

	abstract createFk(params: CreateForeignKeyParams): Promise<void>

	abstract dropFk(params: DropForeignKeyParams): Promise<void>

	abstract createUniqueKey(params: CreateUniqueKeyParams): Promise<void>

	abstract dropUniqueKey(params: DropUniqueKeyParams): Promise<void>
}
