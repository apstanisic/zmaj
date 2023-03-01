import { camel } from "radash"
import { CamelCase } from "type-fest"

///
/// Helper
/// Easier that to define double
///
/**
 * Helper to define consts for collection/field/relation
 * It has uuid id value, camel cased name, and snake cased name
 */
function def<P extends string, I extends string, C extends CamelCase<P>>(
	property: P,
	id: I,
): { snake: P; id: I; camel: C } {
	return { camel: camel(property) as C, id, snake: property }
}
///
/// End helper
///

/**
 *
 */
export const mockCollectionConsts = {
	posts: def("posts", "f25afe54-f0fc-4345-a2e0-965061931946"),
	comments: def("comments", "9a68d983-b032-44f6-abb1-0bad466363c5"),
	tags: def("tags", "db47b5a6-009d-43f4-843e-6a8479b44bd6"),
	posts_tags: def("posts_tags", "a0be7cfa-f0fd-4166-a5bc-ab34e138584c"),
	posts_info: def("posts_info", "d5b99432-cd00-42e5-8866-7a8696dcafd6"),
} as const

export const mockFkNames = {
	comments__posts: "comments_post_id_fkey",
	posts_info__posts: "posts_info_post_id_fkey",
	posts_tags__posts: "posts_tags_post_id_fkey",
	posts_tags__tags: "posts_tags_tag_id_fkey",
} as const

// just for internal use. no export
const tables = mockCollectionConsts

export const mockFieldsConsts = {
	[tables.posts.snake]: {
		id: def("id", "85f96cef-5487-49a4-bfd2-0ce9a1687e4e"),
		title: def("title", "f25f036d-02aa-4497-b9eb-69f3c61c6c19"),
		body: def("body", "f75516cb-24bd-48d9-b59a-a2262f77d0bc"),
		likes: def("likes", "51a29250-0d82-4041-bec1-aff36a6fac1b"),
		created_at: def("created_at", "a6bb1daf-9cb3-4017-803d-4e8a935463c3"),
	},
	[tables.posts_info.snake]: {
		id: def("id", "57442d2b-00f6-4e32-952a-b36823708aee"),
		post_id: def("post_id", "8e2f24c6-d809-4f7b-a48e-96b74e9e737e"),
		additional_info: def("additional_info", "bec5e826-bbde-4913-ba6d-4a97d8b7d9af"),
	},
	[tables.comments.snake]: {
		id: def("id", "95a70912-6d54-4f36-b5a0-6dea833af970"),
		post_id: def("post_id", "8fb0e498-787a-43ee-b57e-60b7e97ec320"),
		body: def("body", "f9a29bff-eb9a-4079-8f3f-771ea96ea028"),
	},
	[tables.tags.snake]: {
		id: def("id", "a359f8b6-d6e6-4892-bb56-938f14617513"),
		name: def("name", "fdd8d3c9-f1f7-4571-a8a8-f9c9ab21514b"),
	},
	[tables.posts_tags.snake]: {
		id: def("id", "b318089a-6d8a-47a0-91b1-234ab5dc9d87"),
		post_id: def("post_id", "5bbec4c5-e036-47e6-a425-d4f5dabadfa6"),
		tag_id: def("tag_id", "79fbf005-5468-4b3b-a07d-bf814ab4ee1f"),
	},
} as const

export const mockRelationsConsts = {
	[tables.posts.snake]: {
		post_info: def("post_info", "2e56cfbb-35cd-4fac-8136-7f6af97e7bfb"),
		tags: def("tags", "0f39f6be-0e45-4477-86e9-05263622a8ba"),
		comments: def("comments", "527f72df-13f8-403a-bc42-00f4f395fb2b"),
	},
	[tables.posts_info.snake]: {
		post: def("post", "a1156ecd-4504-4985-9939-c9683e8b4a41"),
	},
	[tables.comments.snake]: {
		post: def("post", "5f992454-fc8b-4627-a2b8-5fc50cf4523a"),
	},
	[tables.tags.snake]: {
		posts: def("posts", "e68934e8-cbee-4bc3-b3b7-f75b24e7c666"),
	},
	[tables.posts_tags.snake]: {
		post: def("post", "51224771-4899-41cf-a913-f9b1d81c636f"),
		tag: def("tag", "e9a08c51-7c1f-4e9b-9e22-de168ac8b56e"),
	},
} as const

export const mockCompositeUniqueKeyId = {
	posts_tags: "mock_composite_unique_posts_tags",
} as const
