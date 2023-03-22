import { Struct } from "@zmaj-js/common"
import { testSdk } from "./test-sdk.js"

export async function deletePostsByTitle(title: string): Promise<void> {
	await testSdk.collection("posts").temp__deleteWhere({ filter: { title } })
}

export async function createPost(title: string, rest: Struct = {}): Promise<Struct> {
	const res = await testSdk.collection("posts").createOne({ data: { likes: 5, ...rest, title } })
	return res
}
