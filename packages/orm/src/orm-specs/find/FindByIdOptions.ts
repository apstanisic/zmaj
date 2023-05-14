import { Fields, IdType } from "@zmaj-js/orm-common"
import { BaseRepoMethodParams } from "../BaseRepoMethodParams"
export type FindByIdOptions<T, F extends Fields<T> | undefined> = BaseRepoMethodParams & {
	/**
	 * Filter
	 */
	id: IdType

	/**
	 * Fields that user wants
	 */
	fields?: F extends undefined ? Fields<T> : F
}
