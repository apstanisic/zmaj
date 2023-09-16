import { config as envConfig } from "dotenv"
import path from "path"

export function getTestEnvValues(root: string): Record<string, string> {
	const testEnvPath = path.join(root, ".env.test")

	return envConfig({ path: testEnvPath }).parsed ?? {}
}
