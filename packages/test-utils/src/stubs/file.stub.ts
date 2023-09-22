import {
	randDirectoryPath,
	randFileName,
	randFilePath,
	randMimeType,
	randNumber,
	randPastDate,
	randSentence,
} from "@ngneat/falso"
import { FileInfo, FileSchema, stub } from "@zmaj-js/common"
import { v4 } from "uuid"

export const FileStub = stub<FileInfo>(
	() => ({
		createdAt: randPastDate({ years: 4 }),
		description: randSentence(),
		mimeType: randMimeType(),
		storageProvider: "default",
		folderPath: randDirectoryPath(),
		fileSize: randNumber({ min: 1, max: 1_000_000 }),
		name: randFileName(),
		uri: randFilePath(),
		userId: v4(),
		id: v4(),
	}),
	FileSchema,
)
