import { Struct } from "@zmaj-js/common"
import { testSdk } from "./test-sdk.js"

export async function deletePostsByTitle(title: string): Promise<void> {
	const toDelete = await testSdk
		.collection<{ id: string }>("posts")
		.getMany({ filter: { title } as any })
	await Promise.all(
		toDelete.data.map(async (post) => testSdk.collection("posts").deleteById({ id: post.id })),
	)
}

export async function createPost(title: string, rest: Struct = {}): Promise<Struct> {
	const res = await testSdk.collection("posts").createOne({ data: { likes: 5, ...rest, title } })
	return res
}
