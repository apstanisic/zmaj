import { Except, JsonValue } from "type-fest"
import { ColumnDataType, FieldDef } from "../infra-fields"

// rome-ignore format: Not supported

type ParamsWithType<T> = {
	nullable?: boolean
	canRead?: boolean
	canUpdate?: boolean
	canCreate?: boolean
	hasDefault?: boolean
	isPk?: boolean
	dataType: ColumnDataType
	columnName?: string
	_type: T
}

type HandleCanCreate<P extends ParamsWithType<any>> = P & {
	_create: P["canCreate"] extends false
		? undefined
		: P["hasDefault"] extends true
		? P["_type"] | undefined
		: P["isPk"] extends true
		? P["_type"] | undefined
		: P["_type"]
}

type HandleCanUpdate<P extends ParamsWithType<any>> = P & {
	_update: P["canUpdate"] extends false ? undefined : P["_type"] | undefined
}

type HandleCanRead<P extends ParamsWithType<any>> = Except<P, "_type"> & {
	_type: P["canRead"] extends false ? P["_type"] | undefined : P["_type"]
}

type HandleNullable<P extends ParamsWithType<any>> = Except<P, "_type"> & {
	_type: P["nullable"] extends true ? P["_type"] | null : P["_type"]
}

type Combine<Params extends ParamsWithType<any>> = HandleCanRead<
	HandleCanUpdate<HandleCanCreate<HandleNullable<Params>>>
>

type UserParams = Except<ParamsWithType<any>, "_type" | "dataType">
type ExcludeType = Except<ParamsWithType<any>, "_type">

export type BuildType<P extends UserParams, T> = Combine<P & { dataType: ColumnDataType; _type: T }>

const base: Partial<UserParams> = {
	nullable: false,
	canRead: true,
	canUpdate: true,
	canCreate: true,
	isPk: false,
	hasDefault: false,
}

function int<const Params extends UserParams>(
	params: Params,
	meta?: Partial<FieldDef>,
): BuildType<Params, number> {
	return { ...base, ...meta, ...params, dataType: "int" } satisfies ExcludeType as any
}

function float<const Params extends UserParams>(
	params: Params,
	meta?: Partial<FieldDef>,
): BuildType<Params, number> {
	return { ...base, ...meta, ...params, dataType: "float" } satisfies ExcludeType as any
}

function shortText<const Params extends UserParams>(
	params: Params,
	meta?: Partial<FieldDef>,
): BuildType<Params, string> {
	return { ...base, ...meta, ...params, dataType: "short-text" } satisfies ExcludeType as any
}
function longText<const Params extends UserParams>(
	params: Params,
	meta?: Partial<FieldDef>,
): BuildType<Params, string> {
	return { ...base, ...meta, ...params, dataType: "long-text" } satisfies ExcludeType as any
}

function boolean<const Params extends UserParams>(
	params: Params,
	meta?: Partial<FieldDef>,
): BuildType<Params, boolean> {
	return { ...base, ...meta, ...params, dataType: "boolean" } satisfies ExcludeType as any
}

function uuid<const Params extends UserParams>(
	params: Params,
	meta?: Partial<FieldDef>,
): BuildType<Params, string> {
	return { ...base, ...meta, ...params, dataType: "uuid" } satisfies ExcludeType as any
}

function time<const Params extends UserParams>(
	params: Params,
	meta?: Partial<FieldDef>,
): BuildType<Params, string> {
	return { ...base, ...meta, ...params, dataType: "time" } satisfies ExcludeType as any
}

function date<const Params extends UserParams>(
	params: Params,
	meta?: Partial<FieldDef>,
): BuildType<Params, string> {
	return { ...base, ...meta, ...params, dataType: "date" } satisfies ExcludeType as any
}

function dateTime<const Params extends UserParams>(
	params: Params,
	meta?: Partial<FieldDef>,
): BuildType<Params, Date> {
	return { ...base, ...meta, ...params, dataType: "datetime" } satisfies ExcludeType as any
}

function json<const Params extends UserParams>(
	params: Params,
	meta?: Partial<FieldDef>,
): BuildType<Params, JsonValue> {
	return { ...base, ...meta, ...params, dataType: "json" } satisfies ExcludeType as any
}

// This works, but I can't guarantee that value from db will be in this enum
function enumString<const Params extends UserParams & { enum: readonly string[] }>(
	params: Params,
	meta?: Partial<FieldDef>,
): BuildType<Params, Params["enum"][number]> {
	return { ...base, ...meta, ...params, dataType: "short-text" } satisfies ExcludeType as any
}

function createdAt(params: Pick<UserParams, "columnName">): BuildType<
	{
		readonly canCreate: false
		readonly canUpdate: false
		readonly hasDefault: true
		readonly columnName: string | undefined
	},
	Date
> {
	return dateTime({
		canCreate: false,
		canUpdate: false,
		hasDefault: true,
		columnName: params.columnName,
	})
}

export const db = {
	int,
	float,
	shortText,
	longText,
	boolean,
	uuid,
	time,
	date,
	dateTime,
	json,
	createdAt,
	enumString,
}

export function Fields<T extends Record<string, BuildType<any, any>>>(
	model: (fieldsBuilder: typeof db) => T,
): T {
	return model(db)
}

export type ExtractType<T extends Record<string, BuildType<any, any>>> = {
	[key in keyof T]: T[key]["_type"]
}

export type ExtractCreateParams<T extends Record<string, BuildType<any, any>>> = {
	[key in keyof T]: T[key]["_create"]
}

export type ExtractUpdateParams<T extends Record<string, BuildType<any, any>>> = {
	[key in keyof T]: T[key]["_update"]
}

export type AttachRelations<
	T extends Record<string, BuildType<any, any>>,
	Rel extends { key: string },
> = ExtractType<T> & Rel
