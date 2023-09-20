import { ZmajSdk } from "@zmaj-js/client-sdk"
import { TPost, TPostModel } from "@zmaj-js/test-utils"
import { GetReadFields } from "zmaj"
import { getSdk } from "./getSdk.js"

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
	rest: Partial<GetReadFields<TPostModel, true>> = {},
	sdk?: ZmajSdk,
): Promise<TPost> {
	sdk ??= getSdk()
	try {
		const res = await sdk
			.collection<TPostModel>("posts")
			.createOne({ data: { likes: 5, ...rest, title } })
		return res
	} catch (error) {
		console.error("Err creating post")
		console.log(error)
		console.log(JSON.stringify(error))
		throw error
	}
}
