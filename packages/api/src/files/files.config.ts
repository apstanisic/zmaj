import { Inject, Injectable } from "@nestjs/common"
import { zodCreate, ZodDto } from "@zmaj-js/common"
import { z } from "zod"
import { MODULE_OPTIONS_TOKEN } from "./files.module-definition"

const _50MB = 50 * 1024 * 1024

export const ImageSizeSchema = z.object({
	name: z.string().min(1).max(200),
	height: z.number().gte(1).lte(20000).optional(),
	width: z.number().gte(1).lte(20000).optional(),
	fit: z.enum(["cover", "contain", "fill", "inside", "outside"]).default("inside"),
	shouldEnlarge: z.boolean().default(false),
	// shouldShrink: z.boolean().default(true),
})

export type ImageSizeConfig = z.infer<typeof ImageSizeSchema>

// todo On demand generate image
export const FilesConfigSchema = z.object({
	generateCommonImageSizes: z.boolean().default(false),
	imageSizes: z.array(ImageSizeSchema).default([]),
	/**
	 * Max upload file size in bytes
	 */
	maxUploadSize: z.number().min(1).default(_50MB),
	// allowedExtensions: z.array(z.string()).optional(),
})

export type FilesConfigParams = z.input<typeof FilesConfigSchema>

@Injectable()
export class FilesConfig extends ZodDto(FilesConfigSchema) {
	constructor(@Inject(MODULE_OPTIONS_TOKEN) params: FilesConfigParams) {
		const commonSizes = [
			zodCreate(ImageSizeSchema, { name: "original", fit: "contain" }), //
			// zodCreate(ImageSizeSchema, { name: "large", fit: "inside", height: 1920, width: 1920 }), //
			// zodCreate(ImageSizeSchema, { name: "medium", fit: "inside", height: 1080, width: 1080 }), //
			// zodCreate(ImageSizeSchema, { name: "small", fit: "inside", height: 480, width: 480 }), //
			zodCreate(ImageSizeSchema, {
				name: "thumbnail",
				height: 192,
				width: 192,
				fit: "cover",
				shouldEnlarge: true,
			}),
		]
		const providedSizes = params.imageSizes ?? []

		super({
			...params,
			imageSizes:
				params.generateCommonImageSizes === true
					? [...commonSizes, ...providedSizes] // common sizes first, so user can override them
					: providedSizes,
		})
	}
}
