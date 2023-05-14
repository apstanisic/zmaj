import { Filter } from "@zmaj-js/orm-common"
import { BaseRepoMethodParams } from "../BaseRepoMethodParams"

export type CountOptions<T> = BaseRepoMethodParams & { where?: Filter<T> }
