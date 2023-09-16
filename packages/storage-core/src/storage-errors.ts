import type { ZodError } from "zod"

/**
 * Generic storage error
 */
export class StorageError extends Error {
	httpError = 400
	constructor(
		message?: string,
		public options?: ErrorOptions,
	) {
		super(message, options)
		this.initName()
	}

	initName(): void {
		this.name = this.constructor.name
	}
}

/**
 * User is trying to access storage provider that does not exists
 */
export class StorageProviderNotFound extends StorageError {
	override httpError: number = 404
	constructor(path: string) {
		super(`Invalid provider used: ${path}`)
	}
}

/**
 * User provider invalid path
 */
export class InvalidFilePathError extends StorageError {
	override httpError = 400
	constructor(path: string) {
		super(`Invalid file path: ${path}`)
	}
}

/**
 * User requested file that does not exist
 */
export class FileNotFoundError extends StorageError {
	override httpError = 404
	constructor(path: string) {
		super(`File not found: ${path}`)
	}
}

/**
 * User is trying to upload file on provider where uploading is disabled
 */
export class FileUploadDisabledError extends StorageError {}

/**
 * User provided invalid config for provider
 */
export class StorageConfigError extends StorageError {
	override httpError = 500
	constructor(err: ZodError) {
		super(err.message, { cause: err })
	}
}

export class FileAlreadyExistsError extends StorageError {
	override httpError: number = 400
	constructor(path: string) {
		super(`File already exists: ${path}`)
	}
}

export class InvalidFileError extends StorageError {
	override httpError = 400
}

export class InvalidProviderError extends StorageError {
	override httpError = 500
}
