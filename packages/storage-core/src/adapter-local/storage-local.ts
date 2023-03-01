/* eslint-disable import/no-named-as-default-member */
import { throwErr, zodCreate } from "@zmaj-js/common"
import fse, { ReadStream } from "fs-extra"
import { pipeline } from "node:stream/promises"
import path from "path"
import { Readable } from "stream"
import {
	BaseStorage,
	FileProperties,
	FilePropertiesSchema,
	NativeResult,
	StorageResult,
} from "../base-storage"
import { ProviderConfig } from "../provider-config.type"
import {
	FileAlreadyExistsError,
	FileNotFoundError,
	FileUploadDisabledError,
	InvalidFileError,
	StorageConfigError,
	StorageError,
} from "../storage-errors"
import { LocalStorageConfig, LocalStorageConfigSchema } from "./local-storage-config.schema"

/**
 * Adapter for accessing local storage
 *
 * Call 'sanitize' method before using any 'fs' command. Paths should be sanitized only once.
 * Do not send sanitized value to methods from other methods, as that will sanitize them twice
 */
export class LocalFileStorage extends BaseStorage {
	static override readonly type = "local"
	instance?: unknown

	/**
	 * Root path from where we will fetch files.
	 *
	 * Schema will ensure that it's always absolute path
	 */
	protected override basePath: string

	static fromStruct(params: ProviderConfig): BaseStorage {
		const res = LocalStorageConfigSchema.safeParse(params)
		if (!res.success) throw new StorageConfigError(res.error)

		return new LocalFileStorage(res.data)
	}
	/**
	 *
	 * @param config Allow partial since this method should only be called from storage manager.
	 * All params are required.
	 */
	constructor(config: LocalStorageConfig) {
		super(config)
		this.basePath = config.basePath
	}

	/**
	 * List all files, it will recursively go trough folders and read files
	 */
	async list(folderPath: string): Promise<StorageResult<{ paths: string[] }>> {
		const sanitized = this.sanitize(folderPath)
		const paths: string[] = []

		const isDir = await this.isDirectory(sanitized)
		if (!isDir) throw new FileNotFoundError(sanitized)

		// Return file info, we need this to access sub folders
		const all = await fse
			.readdir(sanitized, { withFileTypes: true })
			.catch((e) => throwErr(new StorageError("9712", { cause: e })))

		for (const item of all) {
			const itemPath = path.join(sanitized, item.name)

			// if file
			if (item.isFile()) {
				paths.push(itemPath)
			}
			// if directory
			else if (item.isDirectory()) {
				// don't pass sanitized path, we don't want to sanitize multiple times
				const res = await this.list(path.join(folderPath, item.name))
				paths.push(...res.paths)
			}
		}

		return { paths, nativeResult: undefined }
	}

	/**
	 * Temp until switch to esm only
	 */
	private fileTypeFromFile?: typeof import("file-type")["fileTypeFromFile"]

	/**
	 * Get info about file
	 */
	async info(filePath: string): Promise<StorageResult<FileProperties>> {
		filePath = this.sanitize(filePath)

		if (!this.fileTypeFromFile) {
			this.fileTypeFromFile = (await import("file-type")).fileTypeFromFile
		}

		const info = await fse.stat(filePath).catch((e: NodeJS.ErrnoException) =>
			throwErr(
				e.code === "ENOENT"
					? new FileNotFoundError(filePath) //
					: new StorageError("#0812", e),
			),
		)

		// Get mime type from file content
		const mimeType = info.isFile() ? await this.fileTypeFromFile(filePath) : undefined

		return zodCreate(FilePropertiesSchema, {
			fullPath: filePath,
			size: info.size,
			lastModified: info.mtime,
			type: mimeType?.mime,
			nativeResult: info,
			isDir: info.isDirectory(),
		})
	}

	/**
	 * Move file
	 *
	 * `fs-extra` will create missing folders (mkdirp)
	 * It can move whole folder, not just files
	 */
	async move(source: string, dest: string): Promise<NativeResult> {
		const paths = await this.transferPossible(source, dest)
		try {
			await fse.move(paths.source, paths.dest)
		} catch (error) {
			throw new StorageError(`Move failed. Source: ${source}; Dest: ${dest}`, {
				cause: error as Error,
			})
		}
		return { nativeResult: undefined }
	}

	/**
	 * Copy file
	 *
	 * `fs-extra` will create missing folders (mkdirp)
	 * It can copy whole folder, not just files
	 */
	async copy(source: string, dest: string): Promise<NativeResult> {
		const paths = await this.transferPossible(source, dest)
		try {
			await fse.copy(paths.source, paths.dest)
		} catch (error) {
			throw new StorageError(`Copy failed. Source: ${source}; Dest: ${dest}`, {
				cause: error as Error,
			})
		}
		return { nativeResult: undefined }
	}

	/**
	 * Upload file
	 *
	 */
	async upload({
		path: filePath,
		source,
	}: {
		source: Readable | Buffer | string
		path: string
	}): Promise<NativeResult> {
		if (this.uploadDisabled) throw new FileUploadDisabledError()

		// It sanitizes path internally
		const exists = await this.pathExists(filePath)
		if (exists) throw new FileAlreadyExistsError(filePath)

		const validPath = this.sanitize(filePath)

		await fse.ensureDir(path.dirname(validPath))
		// Only ensure dir when we are sure that file type is valid
		if (typeof source === "string" || Buffer.isBuffer(source)) {
			await fse.writeFile(validPath, source)
			return { nativeResult: undefined }
			//
		} else if (source instanceof Readable) {
			const writeStream = fse.createWriteStream(validPath)

			await pipeline(source, writeStream)
			return { nativeResult: undefined }
		} else {
			throw new InvalidFileError()
		}
	}

	/**
	 * Get file as buffer
	 */
	async getFileBuffer(path: string): Promise<Buffer> {
		// const stream = await this.getFile(path)
		// const buffer = await this.streamToBuffer(stream)
		// return buffer

		// throws if not found
		const info = await this.info(path)
		// We can't fetch whole folder
		if (info.isDir) throw new FileNotFoundError(path)

		try {
			const fullPath = this.sanitize(path)
			const buffer = await fse.readFile(fullPath)
			return buffer
		} catch (error) {
			throw new StorageError("#91721")
		}
	}

	/**
	 * Get file
	 *
	 * @returns `stream.Readable`
	 */
	async getFile(filePath: string): Promise<ReadStream> {
		// Throws if file does not exists. Don't sanitize
		const info = await this.info(filePath)
		// We can't fetch whole folder
		if (info.isDir) throw new FileNotFoundError(filePath)

		return fse.createReadStream(this.sanitize(filePath))
	}

	/**
	 * Remove files and dirs
	 */
	async delete(filePath: string): Promise<NativeResult> {
		const toDelete = this.sanitize(filePath)

		try {
			await fse.remove(toDelete)
			return { nativeResult: undefined }
		} catch (error) {
			throw new StorageError("#0154")
		}
	}

	async deleteFile(filePath: string): Promise<NativeResult> {
		const info = await this.info(filePath)
		if (info.isDir) throw new StorageError("9489")

		try {
			await fse.remove(info.fullPath)
			return { nativeResult: undefined }
		} catch (error) {
			throw new StorageError("#0154")
		}
	}

	async deleteFolder(filePath: string): Promise<{ paths: undefined }> {
		const info = await this.info(filePath).catch((e) =>
			e instanceof FileNotFoundError ? undefined : throwErr(e),
		)
		// if path does not exist, do nothing
		if (info === undefined) return { paths: undefined }
		// if path does exist, and is file, throw an error
		if (!info.isDir) throw new StorageError("9489")

		try {
			await fse.remove(info.fullPath)
			return { paths: undefined }
		} catch (error) {
			throw new StorageError("#0154")
		}
	}

	/**
	 * remove many files and dirs
	 */
	async deleteMany(paths: string[]): Promise<NativeResult> {
		await Promise.all(paths.map(async (p) => this.delete(p)))

		return { nativeResult: undefined }
	}

	/**
	 * Check if file exist
	 *
	 * Return `true` if file or dir exist
	 */
	async pathExists(filePath: string): Promise<boolean> {
		const cleanPath = this.sanitize(filePath)

		try {
			return await fse.pathExists(cleanPath)
		} catch (error) {
			throw new StorageError("#01823", { cause: error as Error })
		}
	}

	/**
	 * Check if provided path is directory
	 *
	 * @param path Path to check
	 * @returns
	 */
	private async isDirectory(path: string): Promise<boolean> {
		const exists = await this.pathExists(path)
		if (!exists) return false
		const info = await fse.stat(path)
		return info.isDirectory()
	}

	/**
	 * Ensure that provided path are safe, that source exists, and that dest if free
	 * We can also transfer whole directories
	 */
	private async transferPossible(
		source: string,
		dest: string,
	): Promise<{ source: string; dest: string }> {
		source = this.sanitize(source)
		dest = this.sanitize(dest)

		const sourceExists = await this.pathExists(source)
		if (!sourceExists) throw new FileNotFoundError(source)

		const destExists = await this.pathExists(dest)
		if (destExists) throw new FileAlreadyExistsError(dest)

		return { source, dest }
	}

	/** Required by the api */
	async destroy(): Promise<void> {}
	async init(): Promise<void> {}
}
