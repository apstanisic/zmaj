import { fileExtensionRegex } from "@common/regexes"
import { now } from "@common/utils/now"
import { ModelSchema } from "@common/zod"
import { v4 } from "uuid"
import { z } from "zod"
import { FileModel } from "./file.model"

export const FileSchema = ModelSchema<FileModel>()(
	z.object({
		name: z.string().min(1).max(200),
		fileSize: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER),
		uri: z.string().min(1).max(200),
		extension: z.string().regex(fileExtensionRegex).nullable().default(null),
		mimeType: z.string().min(2).max(150),
		storageProvider: z.string().min(1).max(100).default("default"),
		id: z.string().uuid().default(v4),
		createdAt: z.date().default(now),
		description: z.string().max(1000).nullable().default(null),
		folderPath: z.string().min(1).max(200).default("/"),
		userId: z.string().uuid().nullable().default(null),
	}),
)
