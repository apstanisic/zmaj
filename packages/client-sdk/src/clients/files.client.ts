import { sdkThrow } from "@client-sdk/errors/error-utils"
import { SdkHttpError } from "@client-sdk/errors/sdk-http.error"
import {
	Data,
	endpoints,
	FileInfo,
	FileModel,
	getEndpoints,
	IdRecord,
	isIn,
	STORAGE_PROVIDER_HEADER,
} from "@zmaj-js/common"
import { AxiosInstance, AxiosProgressEvent } from "axios"
// Not working currently in esbuild
// https://github.com/axios/axios/discussions/4842
// import NodeFormData from "form-data"
import { CrudClient } from "./crud.client"

const ep = getEndpoints((e) => e.files)

type FileData = Blob

/**
 * Upload files
 */
export class FilesClient extends CrudClient<FileModel> {
	constructor(client: AxiosInstance) {
		super(client, endpoints.files.$base)
	}
	/**
	 * Find pretty way to remove this method or to make it an alias to `upload`
	 * This is currently fastest way
	 * @deprecated
	 */
	override createOne(): never {
		sdkThrow("Use `upload` instead of `createOne`")
	}

	async getFolders(): Promise<string[]> {
		return this.http
			.get<Data<string[]>>("/files/folders")
			.then((res) => res.data.data)
			.catch(sdkThrow)
	}

	/** Get all storage providers */
	async getStorageProviders(): Promise<string[]> {
		return this.http
			.get<Data<string[]>>(ep.providers)
			.then((r) => r.data.data)
			.catch(sdkThrow)
	}

	/**
	 * Download file
	 */
	async download(file: IdRecord<FileInfo>): Promise<Blob> {
		const response = await this.http
			.get(ep.download.replace(":id", file.id), { responseType: "blob" })
			.catch(sdkThrow)

		// todo make this work in nodejs
		if (response.data instanceof globalThis.window.Blob) return response.data
		sdkThrow("Invalid file download")
	}

	async upload(params: UploadParams): Promise<IdRecord<FileInfo>> {
		const { signal, file, provider, onProgress } = params

		const data = params.formData ?? new FormData()
		data.append("file", file)

		// Only set provider header if provided and not default
		const headers = isIn(provider, [null, undefined, "default"])
			? undefined
			: { [STORAGE_PROVIDER_HEADER]: provider }

		return this.http
			.post<Data<IdRecord<FileInfo>>>(ep.upload, data, {
				headers,
				signal,
				onUploadProgress: onProgress,
			})
			.then((response) => response.data.data)
			.catch(sdkThrow)
	}

	/**
	 * Experimental async generators for multiple file upload.
	 *
	 * It uploads file one by one, so it does not overwhelm server.
	 * It returns error since we don't want to interrupt upload, we want to allow user to chose
	 * if he/she wants to throw
	 *
	 * @example
	 * ```js
	 * for await (const [file, error] of uploadMany()) {
	 *   if (error !== null) {
	 *     print("error")
	 *   } else {
	 *     print(file.id)
	 *   }
	 * }
	 *
	 * ```
	 */
	async *uploadMany(params: Omit<UploadParams, "file"> & { files: FileData[] }): AsyncGenerator<
		| [IdRecord<FileInfo>, null] //
		| [null, SdkHttpError],
		void,
		unknown
	> {
		const { files, ...other } = params
		for (const file of files) {
			if (params.signal?.aborted) return
			try {
				const result = await this.upload({ ...other, file })
				yield [result, null]
			} catch (error) {
				yield [null, error as SdkHttpError]
			}
			// yield result
		}
	}
}

/**
 * Parameters that are passed to `upload` method
 */
export type UploadParams = {
	/** File to be uploaded */
	file: FileData
	/** Provider to be used to save file */
	provider?: string | null
	/** Cancellation signal, from `AbortController` */
	signal?: AbortSignal
	/** Function to be invoked every time axios emits progress */
	onProgress?: (progress: AxiosProgressEvent) => void
	/* WIP NodeJS compatibility */
	formData?: FormData
}
