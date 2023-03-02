import {
	CopyObjectCommand,
	CopyObjectCommandOutput,
	CreateBucketCommand,
	DeleteObjectCommand,
	DeleteObjectCommandOutput,
	DeleteObjectsCommand,
	DeleteObjectsCommandOutput,
	GetObjectCommand,
	GetObjectCommandOutput,
	HeadBucketCommand,
	HeadObjectCommand,
	HeadObjectCommandOutput,
	ListObjectsV2Command,
	ListObjectsV2CommandOutput,
	PutObjectCommandOutput,
	S3Client,
} from "@aws-sdk/client-s3"
import { Upload } from "@aws-sdk/lib-storage"
import {
	BaseStorage,
	FileNotFoundError,
	FileProperties,
	FileUploadDisabledError,
	FileUploadParams,
	InvalidProviderError,
	NativeResult,
	ProviderConfig,
	StorageConfigError,
	StorageError,
	StorageResult,
} from "@zmaj-js/storage-core"
import { Readable } from "stream"
import { S3StorageConfig, s3StorageConfigSchema } from "./s3-storage.config"

/**
 * @todo Tested on Minio, test on other s3 providers
 */
export class S3Storage extends BaseStorage {
	static override readonly type = "s3"
	private bucket: string
	public s3: S3Client

	static fromStruct(params: ProviderConfig): S3Storage {
		const validated = s3StorageConfigSchema.safeParse(params)
		if (!validated.success) throw new StorageConfigError(validated.error)

		return new S3Storage(validated.data)
	}

	constructor(private config: S3StorageConfig) {
		super(config)

		this.bucket = config.bucket
		this.s3 = new S3Client({
			region: config.region,
			endpoint: config.endpoint,
			credentials: {
				accessKeyId: config.accessKey,
				secretAccessKey: config.secretKey,
			},
			forcePathStyle: true, // needed with minio?
		})
	}

	async init(): Promise<void> {
		const exist = await this.bucketExists()
		if (exist) return

		if (!this.config.createMissingBucket) {
			throw new InvalidProviderError("S3 bucket does not exist")
		}

		await this.createBucket(this.bucket)
	}

	async createBucket(bucket: string): Promise<void> {
		await this.s3.send(new CreateBucketCommand({ Bucket: bucket }))
	}

	private async bucketExists(): Promise<boolean> {
		try {
			await this.s3.send(new HeadBucketCommand({ Bucket: this.bucket }))
			return true
		} catch (error: any) {
			const isMissing = error.$metadata.httpStatusCode === 404
			if (isMissing) return false

			throw new InvalidProviderError("Problem getting info from S3")
		}
	}

	get instance(): S3Client {
		return this.s3
	}

	/**
	 * s3 method does not return any meaningful data
	 *
	 * s3 returns success if file does not exists, it will return success
	 */
	async delete(path: string): Promise<NativeResult<DeleteObjectsCommandOutput>> {
		const res = await this.deleteMany([path])
		return res
	}

	/**
	 * delete many files
	 *
	 * s3 returns success if file does not exists
	 */
	async deleteMany(paths: readonly string[]): Promise<NativeResult<DeleteObjectsCommandOutput>> {
		try {
			const response = await this.s3.send(
				new DeleteObjectsCommand({
					Bucket: this.bucket,
					Delete: {
						Objects: paths.map((path) => ({ Key: path })),
					},
				}),
			)
			return { nativeResult: response }
		} catch (error) {
			throw new StorageError("Error deleting files", { cause: error as Error })
		}
	}

	async deleteFile(filePath: string): Promise<NativeResult<DeleteObjectCommandOutput>> {
		try {
			const response = await this.s3.send(
				new DeleteObjectCommand({
					Bucket: this.bucket,
					Key: this.sanitize(filePath),
				}),
			)
			return { nativeResult: response }
		} catch (error) {
			throw new StorageError("Error deleting files", { cause: error as Error })
			//
		}
	}

	async deleteFolder(filePath: string): Promise<{ paths: string[] }> {
		const deleted: string[] = []
		// first page does not have cursor
		let cursor: string | undefined
		// is action done
		let isDone = false

		while (!isDone) {
			// don't sanitize, list already does
			const paths = await this.list(filePath, { cursor })

			// do not send empty delete. I think it causes memory leak
			if (paths.paths.length === 0) return { paths: deleted }

			// if there is no cursor , it's last "page"
			// otherwise, set cursor for next page
			if (paths.cursor) {
				cursor = paths.cursor
			} else {
				isDone = true
			}

			try {
				await this.s3.send(
					new DeleteObjectsCommand({
						Bucket: this.bucket,
						Delete: { Objects: paths.paths.map((p) => ({ Key: p })) },
					}),
				)

				deleted.push(...paths.paths)
			} catch (error) {
				throw new StorageError("Error deleting files", { cause: error as Error })
			}
		}
		return { paths: deleted }
	}

	/**
	 * Upload file
	 */
	async upload({ path, source, config }: FileUploadParams): Promise<
		NativeResult<PutObjectCommandOutput>
	> {
		if (this.uploadDisabled) throw new FileUploadDisabledError()

		try {
			const uploading = new Upload({
				client: this.s3,
				params: {
					...config,
					Bucket: this.bucket,
					Key: this.sanitize(path),
					Body: source,
				},
			})
			const response = await uploading.done()
			return { nativeResult: response }
		} catch (error) {
			throw new StorageError("Error uploading file", { cause: error as Error })
		}
	}

	/**
	 * Get file
	 */
	async getFile(path: string): Promise<Readable> {
		let response: GetObjectCommandOutput

		path = this.sanitize(path)
		try {
			response = await this.s3.send(new GetObjectCommand({ Bucket: this.bucket, Key: path }))
			// response = await this.s3.getObject({ Bucket: this.bucket, Key: path })
		} catch (error) {
			if (error instanceof Error && error.name === "NoSuchKey") {
				throw new FileNotFoundError(path)
			}
			throw new StorageError("#0123", { cause: error as Error })
		}

		if (response.Body === undefined) throw new FileNotFoundError("#0512")
		// It returns Readable in Node, and other types in browser
		// https://github.com/aws/aws-sdk-js-v3/issues/1877#issuecomment-776187712
		if (!(response.Body instanceof Readable)) throw new StorageError("#0511")
		return response.Body
	}

	/**
	 * Download file to Buffer
	 */
	async getFileBuffer(path: string): Promise<Buffer> {
		const responseStream = await this.getFile(path)
		const buffer = await this.streamToBuffer(responseStream)
		return buffer
	}

	/**
	 * Check if file exist
	 *
	 * SDK throws error if HEAD is not found, so we check if error has name `NotFound`
	 */
	async pathExists(path: string): Promise<boolean> {
		try {
			await this.s3.send(new HeadObjectCommand({ Bucket: this.bucket, Key: this.sanitize(path) }))
			return true
		} catch (e) {
			const error = this.toError(e)
			if (error.name === "NotFound") return false

			throw new StorageError("#01824", error)
		}
	}

	/**
	 * Copy file
	 *
	 * @todo in some cases s3 will return 200 ok even when there is an error
	 */
	async copy(from: string, to: string): Promise<NativeResult<CopyObjectCommandOutput>> {
		try {
			const response = await this.s3.send(
				new CopyObjectCommand({
					CopySource: this.sanitize(from),
					Key: this.sanitize(to),
					Bucket: this.bucket,
				}),
			)
			return { nativeResult: response }
		} catch (error) {
			throw new StorageError("Problem copying file", { cause: error as Error })
		}
	}

	/**
	 * Move file
	 *
	 * It's simply copy + delete, so we can simply call methods to do that, and they will handle
	 * errors
	 */
	async move(from: string, to: string): Promise<NativeResult> {
		await this.copy(from, to)

		await this.delete(from)

		return { nativeResult: undefined }
	}

	/**
	 * Get file info
	 *
	 * It throws error if head object does not exists, so we have to check if error is `NotFound`
	 * We are ensuring type safety by parsing and validating response
	 */
	async info(path: string): Promise<StorageResult<FileProperties, HeadObjectCommandOutput>> {
		try {
			const rawInfo = await this.s3.send(
				new HeadObjectCommand({
					Bucket: this.bucket,
					Key: this.sanitize(path), //
				}),
			)

			const fileInfo = this.validFileProperties({
				size: rawInfo.ContentLength,
				type: rawInfo.ContentType,
				lastModified: rawInfo.LastModified,
				isDir: false,
			})

			return { ...fileInfo, nativeResult: rawInfo }
		} catch (e) {
			const error = this.toError(e)
			if (error.name === "NotFound") throw new FileNotFoundError("#0182")
			throw new FileNotFoundError("018402")
		}
	}

	/**
	 *
	 * @param folder Folder path
	 * @param params.cursor S3 supports pagination, so we can pass cursor. It's limited to 1000 files
	 */
	async list(
		folder: string,
		params?: { cursor?: string },
	): Promise<StorageResult<{ paths: string[]; cursor?: string }, ListObjectsV2CommandOutput>> {
		// add slash to the end so we don't list partial
		// folder1/file1
		// if we provide folder1/fil, it will return above file. This prevents it
		// if folder is empty, that essentially means root path
		folder = this.sanitize(folder)
		let fixedPath = folder === "" || folder.endsWith("/") ? folder : `${folder}/`
		// can't start with slash
		if (fixedPath.startsWith("/")) {
			fixedPath = fixedPath.substring(1)
		}

		const response = await this.s3.send(
			new ListObjectsV2Command({
				Bucket: this.bucket,
				Prefix: fixedPath,
				ContinuationToken: params?.cursor,
				// Delimiter: params?.recursive ? undefined : '/',
			}),
		)

		if (response.Contents === undefined) return { paths: [], nativeResult: response }

		return {
			paths: response.Contents.map((p) => p.Key).filter(
				(path): path is string => path !== undefined && !path.endsWith("/"),
			),
			nativeResult: response,
			cursor: response.IsTruncated ? response.NextContinuationToken : undefined,
		}
	}

	private toError(err: unknown): Error {
		const valid = err instanceof Error
		if (!valid) throw new StorageError("Unknown error")
		return err
	}

	async destroy(): Promise<void> {
		this.s3.destroy()
	}
}
