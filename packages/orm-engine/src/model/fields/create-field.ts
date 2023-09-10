import { JsonValue } from "type-fest"
import { ColumnDataType } from "./column-data-type"
import { BuildFieldParamsAndType } from "./types/build-field-params-and-type.type"
import { BuildFieldParams } from "./types/build-field-params.type"
import { BuildFieldResult } from "./types/build-field-result.type"

const defaultValues = {
	nullable: false,
	canRead: true,
	canUpdate: true,
	canCreate: true,
	isPk: false,
	hasDefault: false,
} as const satisfies Partial<BuildFieldParams>

function coreBuild<const TParams extends BuildFieldParams>(
	params: TParams,
	columnType: ColumnDataType,
	// ): CreateFieldParamsAndType<any, TParams> {
): any {
	const data: BuildFieldParamsAndType<any, TParams> = {
		...defaultValues,
		...params,
		dataType: columnType,
		_type: undefined as never,
	} as any
	return data
}

/**
 *
 *
 *
 *
 *
 *
 */
function int<const Params extends BuildFieldParams>(
	params: Params,
): BuildFieldResult<number, Params> {
	return coreBuild(params, "int") as any
}

function float<const Params extends BuildFieldParams>(
	params: Params,
): BuildFieldResult<number, Params> {
	return coreBuild(params, "float")
}

function text<const Params extends BuildFieldParams = BuildFieldParams>(
	params: Params,
): BuildFieldResult<string, Params> {
	return coreBuild(params, "text")
}

function boolean<const Params extends BuildFieldParams>(
	params: Params,
): BuildFieldResult<boolean, Params> {
	return coreBuild(params, "boolean")
}

function uuid<const Params extends BuildFieldParams>(
	params: Params,
): BuildFieldResult<string, Params> {
	return coreBuild(params, "uuid")
}

function time<const Params extends BuildFieldParams>(
	params: Params,
): BuildFieldResult<string, Params> {
	return coreBuild(params, "time")
}

function date<const Params extends BuildFieldParams>(
	params: Params,
): BuildFieldResult<string, Params> {
	return coreBuild(params, "date")
}

function dateTime<const Params extends BuildFieldParams>(
	params: Params,
): BuildFieldResult<Date, Params> {
	return coreBuild(params, "datetime")
}

function json<const Params extends BuildFieldParams>(
	params: Params,
): BuildFieldResult<JsonValue, Params> {
	return coreBuild(params, "json")
}

/**
 * We need inner function, since TS does not support providing default generic value:
 * https://github.com/microsoft/TypeScript/pull/26349
 *
 * Example: additionalInfo: f.custom<Record<string, any>>()({}),
 */
function custom<T>() {
	return function <const Params extends BuildFieldParams>(
		params: Params,
	): BuildFieldResult<T, Params> {
		return coreBuild(params, "json")
	}
}

// for now only for strings
function array<const Params extends BuildFieldParams>(
	params: Params,
): BuildFieldResult<string[], Params> {
	return coreBuild(params, "datetime")
}

// This works, but I can't guarantee that value from db will be in this enum
function enumString<const Params extends BuildFieldParams & { enum: readonly string[] }>(
	params: Params,
): BuildFieldResult<Params["enum"][number], Params> {
	return coreBuild(params, "text")
}

function createdAt(params?: Pick<BuildFieldParams, "columnName">): BuildFieldResult<
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

function updatedAt(params?: Pick<BuildFieldParams, "columnName">): BuildFieldResult<
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

/**
 * createField.int({})
 */
export const createField = {
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

/**
 * createFieldBuilder((builder) => builder.boolean({}))
 */
export function createFieldBuilder<T extends Record<string, BuildFieldParamsAndType<any, any>>>(
	model: (fieldsBuilder: typeof createField) => T,
): T {
	return model(createField)
}
