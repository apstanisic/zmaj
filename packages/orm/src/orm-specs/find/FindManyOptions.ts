import { Fields, Filter, IdType } from "@zmaj-js/common"
import { BaseRepoMethodParams } from "../BaseRepoMethodParams"
import { Sort } from "./Sort"
/**
 * Both fields are required, but since we are using repo, repo will provide first param,
 * and typescript can in that case infer 2nd. So we can get full type safety without having
 * to specify types
 */
export type FindManyOptions<T, F extends Fields<T> | undefined> = BaseRepoMethodParams & {
	/**
	 * Limit
	 */
	limit?: number
	/**
	 * Omit
	 */
	offset?: number
	/**
	 * Order By
	 */
	// orderBy?: QueryOrderMap<T>
	orderBy?: Sort<T>

	/**
	 * Where part. User can provide array of ids
	 */
	where?: Filter<T> | IdType[] | IdType

	/**
	 * Fields and relations that we need to get
	 */
	fields?: F extends undefined ? Fields<T> : F
	/**
	 * @internal
	 * TODO
	 */
	includeHidden?: boolean
}
