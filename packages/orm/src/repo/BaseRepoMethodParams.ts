import { Transaction } from "./transaction/transaction.type"

/**
 * All repository methods should contain this type
 */
export type BaseRepoMethodParams = {
	trx?: Transaction
}
