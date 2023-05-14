import { Fields } from "@zmaj-js/orm-common"
import { FindManyOptions } from "./FindManyOptions"

export type FindAndCountOptions<T, F extends Fields<T> | undefined> = FindManyOptions<T, F>
