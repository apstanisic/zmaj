import { config as envConfig } from "dotenv"
import path from "path"

export function getTestEnvValues(): Record<string, string> {
	const testEnvPath = path.join(process.cwd(), ".env.test")

	return envConfig({ path: testEnvPath }).parsed ?? {}
}
