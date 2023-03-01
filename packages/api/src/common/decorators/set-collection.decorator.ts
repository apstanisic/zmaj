import { CustomDecorator, ExecutionContext, SetMetadata } from "@nestjs/common"
import { Reflector } from "@nestjs/core"
import { CollectionDef } from "@zmaj-js/common"

export function SetCollection(collection: CollectionDef): CustomDecorator<"infra-collection"> {
	return SetMetadata("infra-collection", collection)
}

const reflector = new Reflector()

export function getCollectionFromContext(
	ctx: ExecutionContext,
): string | CollectionDef | undefined {
	// First get from method, then try from controller
	const collection = reflector.getAllAndOverride<CollectionDef | undefined>("infra-collection", [
		ctx.getHandler(),
		ctx.getClass(),
	])
	return collection
}
