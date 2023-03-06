import type { Struct } from "@zmaj-js/common"
import path from "path"
import type { Readable } from "stream"
import { z } from "zod"
import type { GenericStorageParams } from "./base-storage-config.schema"
import { InvalidFilePathError, StorageError } from "./storage-errors"

export type StorageResult<Defined = Struct, Native = unknown | undefined> = Defined &
	NativeResult<Native>

export type NativeResult<R = unknown | undefined> = { nativeResult?: R }

export type FileUploadParams = {
	/**
	 * Path where to store file
	 */
	path: string
	/**
	 * File content
	 */
	source: Readable | Blob | Buffer | string
	/**
	 * Additional upload config
	 * This is not always used. S3 uses this to pass additional config to SDK
	 */
	config?: Struct
}

/**
 * Every storage adapter must extend this
 */
export abstract class BaseStorage {
	abstract instance?: unknown

	static readonly type: string

	/**
	 * Can new files be uploaded to storage. This is useful when you want to forbid upload,
	 * but users still need access to download files.
	 * If you want to disable both, simply don't use this instance.
	 */
	uploadDisabled: boolean = false
	/**
	 * Where to store files (this enabled s3 bucket to store with common prefix)
	 */
	protected basePath: string

	/**
	 * @param config
	 */
	constructor(config: GenericStorageParams) {
		this.uploadDisabled = config.uploadDisabled
		this.basePath = config.basePath ?? ""
	}

	/**
	 * Upload file
	 *
	 * @param params
	 */
	abstract upload(params: FileUploadParams): Promise<NativeResult>

	/**
	 * Get file
	 *
	 * @returns file stream
	 */
	abstract getFile(path: string): Promise<Readable>

	/**
	 * Get file as buffer
	 *
	 * @returns file as a buffer
	 */
	abstract getFileBuffer(path: string): Promise<Buffer>

	/**
	 * Delete single file
	 *
	 * Return response from storage engine. We don't know the type
	 * @deprecated
	 */
	abstract delete(path: string): Promise<NativeResult>

	/**
	 * Delete many files
	 * @deprecated
	 */
	abstract deleteMany(paths: string[]): Promise<NativeResult>

	/**
	 *
	 * @param path Folder to delete
	 * @returns paths if available, or undefined (fs does not provide deleted files)
	 */
	abstract deleteFolder(path: string): Promise<{ paths?: string[] }>

	/**
	 * List files
	 *
	 * it will recursively list files
	 *
	 * @param path Path that we want to list
	 */
	abstract list(
		path: string,
		params?: { cursor?: string },
	): Promise<StorageResult<{ paths: string[]; cursor?: string }>>

	/**
	 * Check if file exists
	 *
	 * @param path path at which file is located
	 * @returns `true` if file exists, `false` otherwise.
	 * If file system supports directories, returns `false` if file is dir
	 */
	abstract pathExists(path: string): Promise<boolean>

	/**
	 * Get file info
	 *
	 * @param path path at which file is located
	 * @returns Basic file info
	 */
	abstract info(path: string): Promise<StorageResult<FileProperties>>

	/**
	 * Move file
	 *
	 * @param from path from where to move file
	 * @param to path to where to move file
	 * @returns We don't know what returns, it's up to implementation. It can be void
	 */
	abstract move(from: string, to: string): Promise<NativeResult>

	/**
	 * Copy file
	 *
	 * @param from path from where to copy file
	 * @param to path to where to copy file
	 * @returns We don't know what returns, it's up to implementation. It can be void
	 */
	abstract copy(from: string, to: string): Promise<NativeResult>

	/**
	 * Initialize storage if needed
	 * This method is required, even though it's not always needed, to ensure that user knows
	 */
	abstract init(): Promise<void>

	/**
	 * Destroy Storage's resources
	 * This method is required, even though it's not always needed, to ensure that user knows
	 */
	abstract destroy(): Promise<void>

	/**
	 * Converts stream to buffer
	 * @see https://github.com/nodejs/readable-stream/issues/403#issuecomment-479069043
	 */
	protected async streamToBuffer(stream: Readable): Promise<Buffer> {
		const chunks = []
		for await (const chunk of stream) {
			chunks.push(chunk)
		}

		return Buffer.concat(chunks)
	}

	protected validFileProperties(info: unknown): FileProperties {
		const res = FilePropertiesSchema.safeParse(info)
		if (!res.success) throw new StorageError("#957")
		return res.data
	}

	/**
	 * Join provided path with root path, and ensure  that relative path are not used
	 */
	protected sanitize(filePath: string): string {
		if (filePath.includes("..")) throw new InvalidFilePathError("#1361")
		const normalized = path.join(this.basePath, filePath)
		return normalized
	}
}

/**
 * Returned info for file
 */
// export type FileProperties = {
//   size: number
//   type?: string
//   lastModified: Date
//   additionalInfo?: Struct
// }
export type FileProperties = z.infer<typeof FilePropertiesSchema>

export const FilePropertiesSchema = z.object({
	/**
	 * File size in bytes
	 */
	size: z.number().int().positive(),
	/**
	 * File type
	 * We can't get file type for all types
	 */
	type: z.string().min(1).max(1000).optional(),
	/**
	 * When was file modified last time
	 */
	lastModified: z.date(),
	/**
	 * Check if path is dir. S3 does not have directories by local file system does
	 */
	isDir: z.boolean().default(false),
	/**
	 * Sanitized path
	 */
	fullPath: z.string(),
	/**
	 * Native result that can provide some additional information
	 */
	nativeResult: z.unknown(),
})
