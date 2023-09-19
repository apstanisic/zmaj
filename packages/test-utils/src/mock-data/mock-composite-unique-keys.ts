import { CompositeUniqueKey } from "@zmaj-js/orm"
import { mockCollectionConsts, mockCompositeUniqueKeyId } from "./infra-mock-consts.js"

export const mockCompositeUniqueKeys = {
	posts_tags: {
		columnNames: ["post_id", "tag_id"],
		keyName: mockCompositeUniqueKeyId.posts_tags,
		tableName: mockCollectionConsts.posts_tags.snake,
		schemaName: "default",
	} as CompositeUniqueKey,
}
