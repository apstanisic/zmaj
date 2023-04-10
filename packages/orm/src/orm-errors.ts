import { BaseError, UniqueConstraintError } from "sequelize"

export class ZmajOrmError extends BaseError {
	httpCode = 500
	errorCode = 10000
	constructor(message?: string, code?: number) {
		super(message)
		this.errorCode = code ?? this.errorCode
	}
}

export class InvalidRelationsError extends ZmajOrmError {}

export class UndefinedModelError extends ZmajOrmError {
	constructor(modelName: string, code?: number) {
		super(`Model '${modelName}' does not exist`, code)
	}
}

export class RecordNotFoundError extends ZmajOrmError {
	override httpCode = 404
	constructor(modelName: string, recordId?: string | number) {
		super(
			recordId
				? `Record with id '${recordId}' in table '${modelName}' does not exist`
				: `Record does not exist in ${modelName}`,
		)
	}
}

export class InternalOrmProblem extends ZmajOrmError {
	constructor(public code: number, cause?: any) {
		super("There is a problem with orm library")
		if (cause) {
			this.cause = cause
		}
	}
}

export class TableHasNoPkError extends ZmajOrmError {
	override httpCode: number = 400
	constructor(table: string) {
		super(`Table '${table}' does not have primary key.`)
	}
}

export class InvalidColumnTypeError extends ZmajOrmError {
	constructor(type: string, code?: number) {
		super(`Invalid type '${type}' for column`, code)
	}
}

export class FkDeleteError extends ZmajOrmError {
	override httpCode: number = 400
	constructor() {
		super(`Record can't be deleted since FK points to it`)
	}
}

export class NoPropertyError extends ZmajOrmError {
	override httpCode: number = 400
	constructor(property?: string, public code?: number) {
		super(property ? `Property ${property} does not exist` : "Invalid properties requested")
	}
}

export class UniqueError extends ZmajOrmError {
	override httpCode: number = 400
	constructor(public override cause: UniqueConstraintError, public code: number) {
		super(
			compositeUnique(
				Object.keys(cause.fields),
				Object.values(cause.fields).map((v) => JSON.stringify(v)),
			),
		)
	}
}

export class NoColumnError extends ZmajOrmError {
	override httpCode: number = 404
	override errorCode: number = 5023
	constructor(table: string, column: string) {
		super(`There is no '${column}' in '${table}'`)
	}
}

export class CantBecomeUniqueError extends ZmajOrmError {
	override httpCode: number = 400
	override errorCode: number = 9010
	constructor(table: string, column: string) {
		super(`Column '${column}' in '${table}' can't be unique since there are duplicate values.`)
	}
}

export class CantBecomeNonNullableError extends ZmajOrmError {
	override httpCode: number = 400
	override errorCode: number = 9378
	constructor(table: string, column: string) {
		super(`Column '${column}' in '${table}' can't be non nullable since there are nullable values.`)
	}
}

export class NoFkToDeleteError extends ZmajOrmError {
	override httpCode: number = 400
	override errorCode: number = 3991
	constructor(table: string, column: string) {
		super(`There is no foreign key in '${table}' on '${column}'.`)
	}
}
export class NoUniqueToDropError extends ZmajOrmError {
	override httpCode: number = 400
	override errorCode: number = 9300
	constructor(table: string, columns: string[]) {
		super(`There is no unique key in '${table}' on '${columns.join(",")}'.`)
	}
}

const compositeUnique = (fields: string[], values: string[]): string =>
	`You can't create record since there is already record with fields '${fields.join(
		",",
	)} and values ${values.join(",")}'`
