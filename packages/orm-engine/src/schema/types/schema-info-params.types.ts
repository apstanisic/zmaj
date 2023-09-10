import { Transaction } from "@orm-engine/repo/transaction.type"
import { Except } from "type-fest"

type SchemaInfoCommonParams = { schema?: string; trx?: Transaction }

type Table = { table: string }
type Column = { column: string }

//
export type HasTableParams = SchemaInfoCommonParams & Table
export type HasColumnParams = SchemaInfoCommonParams & Table & Column
//
export type GetPrimaryKeyParams = SchemaInfoCommonParams & Table
//
export type GetTableNamesParams = SchemaInfoCommonParams
//
export type GetColumnsParams = SchemaInfoCommonParams & Partial<Table> & Partial<Column>
export type GetColumnParams = SchemaInfoCommonParams & Table & Column
//
export type GetForeignKeysParams = SchemaInfoCommonParams & Partial<Table> & Partial<Column>
export type GetForeignKeyParams = SchemaInfoCommonParams & Table & Column
//
export type GetUniqueKeysParams = SchemaInfoCommonParams &
	Partial<Table> & { type?: "all" | "single" | "composite" }
export type GetSingleUniqueKeysParams = Except<GetUniqueKeysParams, "type">
export type GetCompositeUniqueKeysParams = Except<GetUniqueKeysParams, "type">
