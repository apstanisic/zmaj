import { TransactionIsolationLevel } from "./transaction-isolation-level"
import { Transaction } from "./transaction.type"

export type TransactionParams<T> = {
	type?: TransactionIsolationLevel
	fn: (trx: Transaction) => Promise<T>
	trx?: Transaction
}
