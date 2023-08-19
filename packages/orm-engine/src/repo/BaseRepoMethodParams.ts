import { Transaction } from "./transaction.type"

/**
 * All repository methods should contain this type
 */
export type BaseRepoMethodParams = {
	trx?: Transaction
}
