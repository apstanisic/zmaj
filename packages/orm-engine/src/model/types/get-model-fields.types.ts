import { BaseModel } from "../base-model"
import { Base } from "../utils/base.type"

export type GetModelFields<T extends BaseModel> = Base<{
	[key in keyof T["fields"]]: T["fields"][key]["_type"]
}>

/**
 *
 */
export type GetReadFields<TModel extends BaseModel, TAddHidden extends boolean> = Base<{
	[key in keyof TModel["fields"]]: TAddHidden extends true
		? TModel["fields"][key]["_readOverride"]
		: TModel["fields"][key]["_read"]
}>

/**
 *
 */
export type GetUpdateFields<TModel extends BaseModel, TAddHidden extends boolean> = Base<{
	[key in keyof TModel["fields"]]: TAddHidden extends true
		? TModel["fields"][key]["_updateOverride"]
		: TModel["fields"][key]["_update"]
}>

/**
 *
 */
export type GetCreateFields<TModel extends BaseModel, TAddHidden extends boolean> = Base<{
	[key in keyof TModel["fields"]]: TAddHidden extends true
		? TModel["fields"][key]["_createOverride"]
		: TModel["fields"][key]["_create"]
}>
