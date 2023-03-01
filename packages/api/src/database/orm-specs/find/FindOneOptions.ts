import { Fields, Filter, IdType } from "@zmaj-js/common"
import { BaseRepoMethodParams } from "../BaseRepoMethodParams"
import { Sort } from "./Sort"

export type FindOneOptions<T, F extends Fields<T> | undefined> = BaseRepoMethodParams & {
	/**
	 * Order By
	 */
	orderBy?: Sort<T>

	/**
	 * Where part. User can provide array of ids
	 */
	where?: Filter<T> | IdType

	/**
	 * Fields that user wants
	 */
	fields?: F extends undefined ? Fields<T> : F
}
