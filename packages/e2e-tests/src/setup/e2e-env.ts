/* eslint-disable @typescript-eslint/no-namespace */
import dotenv from "dotenv"
import { ExecaChildProcess, execa } from "execa"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { z } from "zod"
import { e2eConfigSchema } from "./e2eConfigSchema.js"

declare global {
	namespace NodeJS {
		interface ProcessEnv extends z.infer<typeof e2eConfigSchema> {}
	}
}

const dir = dirname(fileURLToPath(import.meta.url))
export const repoRoot = join(dir, "../../../..")
export const e2eRoot = join(dir, "../..")

export function initTestProcessEnv(): z.infer<typeof e2eConfigSchema> {
	const envResult = dotenv.config({ path: join(repoRoot, ".env.test") })
	if (envResult.error) throw new Error("No .env.test file found")
	return e2eConfigSchema.parse(envResult.parsed)
}

export function runMake(...params: string[]): ExecaChildProcess<string> {
	return execa("make", [...params], { cwd: repoRoot, env: process.env })
}
