import { ZodDto } from "../../zod/zod-dto"
import { CollectionMetadataSchema } from "./collection-metadata.schema"

export const CollectionUpdateSchema = CollectionMetadataSchema.pick({
	disabled: true,
	hidden: true,
	label: true,
	layoutConfig: true,
	displayTemplate: true,
	// createdAtFieldId: true,
	// updatedAtFieldId: true,
}).partial()

export class CollectionUpdateDto extends ZodDto(CollectionUpdateSchema) {}
