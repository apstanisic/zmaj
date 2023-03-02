import { toBase64 } from "./to-base-64"

export function createBasicToken(username: string, password: string): string {
	const usernameAndPassword = username + ":" + password
	return `Basic ${toBase64(usernameAndPassword)}`
}
