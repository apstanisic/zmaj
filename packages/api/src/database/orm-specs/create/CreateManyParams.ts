import { CreateDto } from "@zmaj-js/common"
import { BaseRepoMethodParams } from "../BaseRepoMethodParams"

export type CreateManyParams<T> = BaseRepoMethodParams & {
	/**
	 * Array of entities to be created
	 */
	data: readonly CreateDto<T>[]
}
