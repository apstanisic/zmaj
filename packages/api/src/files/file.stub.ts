import {
	randDirectoryPath,
	randFileExt,
	randFilePath,
	randMimeType,
	randNumber,
	randPastDate,
	randSentence,
	randWord,
} from "@ngneat/falso"
import { FileSchema, Stub } from "@zmaj-js/common"
import { v4 } from "uuid"

export const FileStub = Stub(FileSchema, () => ({
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
}))
