import { mkdir, rm, writeFile } from "fs/promises"
import { defineConfig } from "tsup"
import { defaultTsupConfig } from "../../tsup.config"
import { allTemplates } from "./src/jsx-templates/all"

/**
 *
 * Generate templates, and put them in `dist/templates`
 * it's easier than to run 2 scripts, tsup and mjml -w
 * and for some reason mjml does not detects new files,
 * but tsup will detect when we integrate that file
 *
 */
async function compileEmails(): Promise<void> {
	// const folderPath = "./src/jsx-templates"
	// const files = await readdir(folderPath)

	// sometimes this folder does not exist (on first run), so we ignore error
	// await rm("./dist/templates", { recursive: true }).catch(() => {})
	// await mkdir("./dist/templates")

	console.log("Generating email templates")

	await writeFile("./dist/templates.json", JSON.stringify(allTemplates, null, "\t"))

	console.log(`Generated email templates`)
}

export default defineConfig(() => ({
	...defaultTsupConfig,
	onSuccess: compileEmails,
}))
