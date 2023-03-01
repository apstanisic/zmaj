import { Filter } from "@zmaj-js/common"
import { BaseRepoMethodParams } from "../BaseRepoMethodParams"

export type CountOptions<T> = BaseRepoMethodParams & { where?: Filter<T> }
