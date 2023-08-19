import { Except, JsonValue } from "type-fest"
import { ColumnType } from "./db-column-type"

export type UserParams = {
	nullable?: boolean
	canRead?: boolean
	canUpdate?: boolean
	canCreate?: boolean
	hasDefault?: boolean
	isPk?: boolean
	columnName?: string
	/** @internal */
	isUnique?: boolean
	/** @internal */
	isAutoIncrement?: boolean
	/** @internal */
	isCreatedAt?: boolean
	/** @internal */
	isUpdatedAt?: boolean
}

type ParamsAndType<TType, TField extends UserParams = UserParams> = TField & {
	dataType: ColumnType
	_type: TType
}

export type AllFields = Record<string, ParamsAndType<any>>

type HandleCanCreate<P extends ParamsAndType<any>> = P & {
	_create: P["canCreate"] extends false
		? undefined
		: P["hasDefault"] extends true
		? P["_type"] | undefined | null
		: P["isPk"] extends true
		? P["_type"] | undefined | null
		: P["nullable"] extends true
		? P["_type"] | undefined | null
		: P["_type"]
}

type HandleCanUpdate<P extends ParamsAndType<any>> = P & {
	_update: P["canUpdate"] extends false ? undefined : P["_type"] | undefined
}

type HandleCanRead<P extends ParamsAndType<any>> = Except<P, "_type"> & {
	_type: P["canRead"] extends false ? P["_type"] | undefined : P["_type"]
}

type HandleNullable<P extends ParamsAndType<any>> = Except<P, "_type"> & {
	_type: P["nullable"] extends true ? P["_type"] | null : P["_type"]
}

type Combine<Params extends ParamsAndType<any>> = HandleCanRead<
	HandleCanUpdate<HandleCanCreate<HandleNullable<Params>>>
>

const base = {
	nullable: false,
	canRead: true,
	canUpdate: true,
	canCreate: true,
	isPk: false,
	hasDefault: false,
} satisfies Partial<UserParams>

function build<const TParams extends UserParams>(
	params: TParams,
	columnType: ColumnType,
	// ): ParamsAndType<any, TParams> {
): any {
	const data: ParamsAndType<any, TParams> = {
		...base,
		...params,
		dataType: columnType,
		_type: undefined as any,
	} as any
	return data
}

export function fields<T extends Record<string, ParamsAndType<any, any>>>(
	model: (fieldsBuilder: typeof db) => T,
): T {
	return model(db)
}

type CombineAll<TType, TParams extends UserParams> = Combine<ParamsAndType<TType, TParams>>
/**
 *
 *
 *
 *
 *
 *
 */
function int<const Params extends UserParams>(params: Params): CombineAll<number, Params> {
	return build(params, "int") as any
}

function float<const Params extends UserParams>(params: Params): CombineAll<number, Params> {
	return build(params, "float")
}

function text<const Params extends UserParams = UserParams>(
	params: Params,
): CombineAll<string, Params> {
	return build(params, "text")
}

function boolean<const Params extends UserParams>(params: Params): CombineAll<boolean, Params> {
	return build(params, "boolean")
}

function uuid<const Params extends UserParams>(params: Params): CombineAll<string, Params> {
	return build(params, "uuid")
}

function time<const Params extends UserParams>(params: Params): CombineAll<string, Params> {
	return build(params, "time")
}

function date<const Params extends UserParams>(params: Params): CombineAll<string, Params> {
	return build(params, "date")
}

function dateTime<const Params extends UserParams>(params: Params): CombineAll<Date, Params> {
	return build(params, "datetime")
}

function json<const Params extends UserParams>(params: Params): CombineAll<JsonValue, Params> {
	return build(params, "json")
}

/**
 * We need inner function, since TS does not support providing default generic value:
 * https://github.com/microsoft/TypeScript/pull/26349
 */
function custom<T>() {
	return function <const Params extends UserParams>(params: Params): CombineAll<T, Params> {
		return build(params, "json")
	}
}

// for now only for strings
function array<const Params extends UserParams>(params: Params): CombineAll<string[], Params> {
	return build(params, "datetime")
}

// This works, but I can't guarantee that value from db will be in this enum
function enumString<const Params extends UserParams & { enum: readonly string[] }>(
	params: Params,
): CombineAll<Params["enum"][number], Params> {
	return build(params, "text")
}

function createdAt(params?: Pick<UserParams, "columnName">): CombineAll<
	Date,
	{
		readonly canCreate: false
		readonly canUpdate: false
		readonly hasDefault: true
		readonly columnName: string | undefined
		readonly isCreatedAt: true
	}
> {
	return dateTime({
		canCreate: false,
		canUpdate: false,
		hasDefault: true,
		columnName: params?.columnName ?? "created_at",
		isCreatedAt: true,
	})
}

function updatedAt(params?: Pick<UserParams, "columnName">): CombineAll<
	Date,
	{
		readonly canCreate: false
		readonly canUpdate: false
		readonly hasDefault: true
		readonly columnName: string | undefined
		readonly isUpdatedAt: true
	}
> {
	return dateTime({
		canCreate: false,
		canUpdate: false,
		hasDefault: true,
		columnName: params?.columnName ?? "created_at",
		isUpdatedAt: true,
	})
}

export const db = {
	int,
	float,
	text,
	boolean,
	uuid,
	time,
	date,
	dateTime,
	json,
	createdAt,
	updatedAt,
	enumString,
	array,
	custom,
}
