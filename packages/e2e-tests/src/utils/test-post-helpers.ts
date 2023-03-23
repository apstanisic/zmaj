import { ZmajSdk } from "@zmaj-js/client-sdk"
import { OnlyFields } from "@zmaj-js/common"
import { TPost } from "@zmaj-js/test-utils"
import { getSdk } from "./test-sdk.js"

export async function deletePostsByTitle(title: string, sdk?: ZmajSdk): Promise<void> {
	try {
		await (sdk ?? getSdk()).collection("posts").temp__deleteWhere({ filter: { title } })
	} catch (error) {
		console.error("Err creating post")
		console.log(error)
		console.log(JSON.stringify(error))
		throw error
	}
}

export async function createPost(
	title: string,
	rest: Partial<OnlyFields<TPost>> = {},
	sdk?: ZmajSdk,
): Promise<TPost> {
	sdk ??= getSdk()
	try {
		const res = await sdk
			.collection<TPost>("posts")
			.createOne({ data: { likes: 5, ...rest, title } })
		return res
	} catch (error) {
		console.error("Err creating post")
		console.log(error)
		console.log(JSON.stringify(error))
		throw error
	}
}
