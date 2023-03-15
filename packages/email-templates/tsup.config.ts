import { writeFile } from "fs/promises"
import { defineConfig } from "tsup"
import { defaultTsupConfig } from "../../tsup.config"
import { allTemplates } from "./src/jsx-templates/all"

/**
 * This creates templates during build, that way MJML and React are dev dependencies.
 * This should also reduce load a little, since templates are precompiled, and only
 * variables are injected during runtime
 */
async function compileEmails(): Promise<void> {
	console.log("Generating email templates")
	await writeFile("./dist/templates.json", JSON.stringify(allTemplates, null, "\t"))
	console.log(`Generated email templates`)
}

export default defineConfig(() => ({
	...defaultTsupConfig,
	onSuccess: compileEmails,
}))
