import { mkdir, readdir, readFile, rm, writeFile } from "fs/promises"
import mjml2html from "mjml"
import path from "path"
import { defineConfig } from "tsup"
import { defaultTsupConfig } from "../../tsup.config"

/**
 *
 * Generate templates, and put them in `dist/templates`
 * it's easier than to run 2 scripts, tsup and mjml -w
 * and for some reason mjml does not detects new files,
 * but tsup will detect when we integrate that file
 *
 */
async function compileEmails(): Promise<void> {
	const folderPath = "./src/templates"
	const files = await readdir(folderPath)

	// sometimes this folder does not exist (on first run), so we ignore error
	await rm("./dist/templates", { recursive: true }).catch(() => {})
	await mkdir("./dist/templates")

	console.log("Generating email templates")

	for (const fileName of files) {
		const filePath = path.join(folderPath, fileName)
		const file = await readFile(filePath, { encoding: "utf-8" })
		const mjmlResult = mjml2html(file, {
			validationLevel: "strict",
			filePath: folderPath,
			// do not get default fonts
			fonts: {},
		})
		if (mjmlResult.errors.length > 0) {
			console.error("Problem compiling template:", filePath)
			continue
		}
		// ignore file exist error
		const { name } = path.parse(fileName)

		const htmlPath = path.join("./dist/templates", name + ".html")

		await writeFile(htmlPath, mjmlResult.html)
	}

	console.log(`Generated email templates`)
}

export default defineConfig(() => ({
	...defaultTsupConfig,
	onSuccess: compileEmails,
}))
