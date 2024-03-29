import {
	BadRequestException,
	ForbiddenException,
	InternalServerErrorException,
	NotFoundException,
	UnauthorizedException,
} from "@nestjs/common"
import { ErrorResponse, isStruct } from "@zmaj-js/common"

type ErrorThrowObject = Partial<
	Pick<ErrorResponse["error"], "errorCode" | "message"> & { cause?: any }
>
// type ErrorThrowObject = {
// 	// internal error code to locate error
// 	code: number
// 	// user readable message
// 	message?: string
// 	// og error for stack trace
// 	cause?: Error
// }
type ErrorParams = [code: number, message?: string] | [ErrorThrowObject] | []
type ErrorParamsWithMessage = [code: number, message: string] | [ErrorThrowObject] | []

export function handleError(...params: ErrorParams): ErrorThrowObject {
	if (isStruct(params[0])) {
		return params[0]
	} else {
		return {
			errorCode: params[0] ?? 429912,
			message: params[1],
		}
	}
}

/**
 * Internal Server Error Exception
 */
export function throw500(...params: ErrorParams): never {
	// since it's 500 error, there is no need to show user custom message
	if (typeof params[0] === "number") {
		params[1] ??= "Problem with server"
	}
	const meta = handleError(...params)
	throw new InternalServerErrorException(meta, { cause: meta.cause })
}

/**
 * Unauthorized Exception
 *
 * @param err
 */
export function throw401(...params: ErrorParamsWithMessage): never {
	const meta = handleError(...params)
	throw new UnauthorizedException(meta, { cause: meta.cause })
}

/**
 * Forbidden Exception
 *
 * @param err
 */
export function throw403(...params: ErrorParamsWithMessage): never {
	const meta = handleError(...params)
	throw new ForbiddenException(meta, { cause: meta.cause })
}

/**
 * Not Found Exception
 */
export function throw404(...params: ErrorParamsWithMessage): never {
	const meta = handleError(...params)
	throw new NotFoundException(meta, { cause: meta.cause })
}

/**
 * Bad Request Exception
 */
export function throw400(...params: ErrorParamsWithMessage): never {
	const meta = handleError(...params)
	throw new BadRequestException(meta, { cause: meta.cause })
}

export class Error403 extends ForbiddenException {
	constructor(...params: ErrorParamsWithMessage) {
		const meta = handleError(...params)
		super(meta, { cause: meta.cause })
	}
}

export class Error404 extends NotFoundException {
	constructor(...params: ErrorParamsWithMessage) {
		const meta = handleError(...params)
		super(meta, { cause: meta.cause })
	}
}
export class Error401 extends UnauthorizedException {
	constructor(...params: ErrorParamsWithMessage) {
		const meta = handleError(...params)
		super(meta, { cause: meta.cause })
	}
}

export class Error500 extends InternalServerErrorException {
	constructor(...params: ErrorParamsWithMessage) {
		const meta = handleError(...params)
		super(meta, { cause: meta.cause })
	}
}
