import { BaseModel } from "@zmaj-js/orm-common"
import { Class } from "type-fest"

export const allModels: Map<Class<BaseModel>, BaseModel> = new Map()
