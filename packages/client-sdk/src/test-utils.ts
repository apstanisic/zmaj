import { asMock, AuthUser, toBase64 } from "@zmaj-js/common"
import { AuthUserStub } from "@zmaj-js/test-utils"
import { Axios } from "axios"
import { expect } from "vitest"

export async function testEnsureCatch(params: {
	client: Axios
	fn: () => Promise<any>
	// method: "post" | "get" | "put" | "patch" | "delete"
}): Promise<void> {
	const { client, fn } = params

	asMock(client.get).mockRejectedValue({})
	asMock(client.post).mockRejectedValue({})
	asMock(client.put).mockRejectedValue({})
	asMock(client.patch).mockRejectedValue({})
	asMock(client.delete).mockRejectedValue({})

	await expect(async () => fn()).rejects.toThrow()
}

export function stubAccessToken(user: AuthUser = AuthUserStub()): string {
	return `first.${toBase64(JSON.stringify(user))}.third`
}
