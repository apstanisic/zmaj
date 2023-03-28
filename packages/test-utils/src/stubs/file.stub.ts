import {
	randPastDate,
	randSentence,
	randFileExt,
	randMimeType,
	randDirectoryPath,
	randNumber,
	randWord,
	randFilePath,
} from "@ngneat/falso"
import { stub, FileInfo, FileSchema } from "@zmaj-js/common"
import { v4 } from "uuid"

export const FileStub = stub<FileInfo>(
	() => ({
		createdAt: randPastDate({ years: 4 }),
		description: randSentence(),
		extension: randFileExt(),
		mimeType: randMimeType(),
		storageProvider: "default",
		folderPath: randDirectoryPath(),
		fileSize: randNumber({ min: 1, max: 1_000_000 }),
		name: randWord(),
		uri: randFilePath(),
		userId: v4(),
		id: v4(),
	}),
	FileSchema,
)
