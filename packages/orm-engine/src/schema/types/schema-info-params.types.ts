import { Transaction } from "@orm-engine/repo/transaction.type"
import { SetRequired } from "type-fest"

export type SchemaInfoBasicParams = { schema?: string; trx?: Transaction }
export type TableOnlyParams = { table?: string } & SchemaInfoBasicParams
export type TableAndColumnParams = { table?: string; column?: string } & SchemaInfoBasicParams
export type RequiredTableAndColumnParams = SetRequired<TableAndColumnParams, "column" | "table">
