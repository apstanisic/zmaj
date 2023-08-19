import { JsonValue } from "type-fest"
import { ColumnType } from "./db-column-type"
import { CreateFieldParamsAndType } from "./types/create-field-params-and-type.type"
import { CreateFieldParams } from "./types/create-field-params.type"
import { CreateFieldResult } from "./types/create-field-result.type"

const defaultValues = {
	nullable: false,
	canRead: true,
	canUpdate: true,
	canCreate: true,
	isPk: false,
	hasDefault: false,
} as const satisfies Partial<CreateFieldParams>

function innerBuild<const TParams extends CreateFieldParams>(
	params: TParams,
	columnType: ColumnType,
	// ): CreateFieldParamsAndType<any, TParams> {
): any {
	const data: CreateFieldParamsAndType<any, TParams> = {
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
function int<const Params extends CreateFieldParams>(
	params: Params,
): CreateFieldResult<number, Params> {
	return innerBuild(params, "int") as any
}

function float<const Params extends CreateFieldParams>(
	params: Params,
): CreateFieldResult<number, Params> {
	return innerBuild(params, "float")
}

function text<const Params extends CreateFieldParams = CreateFieldParams>(
	params: Params,
): CreateFieldResult<string, Params> {
	return innerBuild(params, "text")
}

function boolean<const Params extends CreateFieldParams>(
	params: Params,
): CreateFieldResult<boolean, Params> {
	return innerBuild(params, "boolean")
}

function uuid<const Params extends CreateFieldParams>(
	params: Params,
): CreateFieldResult<string, Params> {
	return innerBuild(params, "uuid")
}

function time<const Params extends CreateFieldParams>(
	params: Params,
): CreateFieldResult<string, Params> {
	return innerBuild(params, "time")
}

function date<const Params extends CreateFieldParams>(
	params: Params,
): CreateFieldResult<string, Params> {
	return innerBuild(params, "date")
}

function dateTime<const Params extends CreateFieldParams>(
	params: Params,
): CreateFieldResult<Date, Params> {
	return innerBuild(params, "datetime")
}

function json<const Params extends CreateFieldParams>(
	params: Params,
): CreateFieldResult<JsonValue, Params> {
	return innerBuild(params, "json")
}

/**
 * We need inner function, since TS does not support providing default generic value:
 * https://github.com/microsoft/TypeScript/pull/26349
 *
 * Example: additionalInfo: f.custom<Record<string, any>>()({}),
 */
function custom<T>() {
	return function <const Params extends CreateFieldParams>(
		params: Params,
	): CreateFieldResult<T, Params> {
		return innerBuild(params, "json")
	}
}

// for now only for strings
function array<const Params extends CreateFieldParams>(
	params: Params,
): CreateFieldResult<string[], Params> {
	return innerBuild(params, "datetime")
}

// This works, but I can't guarantee that value from db will be in this enum
function enumString<const Params extends CreateFieldParams & { enum: readonly string[] }>(
	params: Params,
): CreateFieldResult<Params["enum"][number], Params> {
	return innerBuild(params, "text")
}

function createdAt(params?: Pick<CreateFieldParams, "columnName">): CreateFieldResult<
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

function updatedAt(params?: Pick<CreateFieldParams, "columnName">): CreateFieldResult<
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
export function createFieldBuilder<T extends Record<string, CreateFieldParamsAndType<any, any>>>(
	model: (fieldsBuilder: typeof createField) => T,
): T {
	return model(createField)
}
