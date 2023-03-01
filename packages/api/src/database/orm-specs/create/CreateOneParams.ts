import { CreateDto } from "@zmaj-js/common"
import { BaseRepoMethodParams } from "../BaseRepoMethodParams"

export type CreateOneParams<T> = BaseRepoMethodParams & {
	/**
	 * Entity data
	 */
	data: CreateDto<T>
}
