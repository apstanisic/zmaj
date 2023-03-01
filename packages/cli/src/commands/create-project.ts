import { intro, isCancel, note, outro, select, spinner, text } from "@clack/prompts"
import fse from "fs-extra"
import path, { join } from "path"
import pc from "picocolors"
import { processExit } from "../prompt-utils.js"
import { BaseYargs, randomString } from "../utils.js"

export function createTemplateCommand(yr: BaseYargs): void {
	yr.command(
		"create-project [folder]",
		"Create new project. Run without options to show prompt",
		(y) =>
			y
				.positional("folder", {
					type: "string",
					demandOption: true,
					describe: "Folder where project will be created",
				})
				.option("template", { type: "string", describe: "What template to use" }),
		async (argv) => createTemplate({ path: argv.folder, template: argv.template }),
	)
}

async function createTemplate(config: { template?: string; path?: string }): Promise<void> {
	intro(`Create Zmaj project`)

	let folderName =
		config.path ??
		(await text({
			message: "Folder name",
			placeholder: "./zmaj-project",
		}))

	if (isCancel(folderName)) processExit()
	folderName = folderName !== "" ? folderName : "zmaj-project"

	const allTemplates = await fse.readdir(path.join(__dirname, "templates"))
	const template =
		config.template ??
		(await select({
			message: "Select template",
			options: allTemplates.map((value) => ({ value })),
			initialValue: "default",
		}))

	if (isCancel(template)) processExit()

	const templatePath = join(__dirname, "templates", template)

	const exist = await fse.pathExists(templatePath)
	if (!exist) {
		outro(pc.red(`Template "${template}" does not exist`))
		process.exit(1)
	}

	await fse.mkdirp(folderName)

	const sp = spinner()
	sp.start(pc.blue("Creating project..."))
	await fse.copy(templatePath, folderName)
	sp.stop(pc.green("Project created"))

	const env = {
		"# App config": "",
		SECRET_KEY: randomString(40),
		APP_NAME: "Zmaj App",
		APP_PORT: "5000",
		APP_URL: "http://localhost:5000",
		"# Database": "",
		DB_USERNAME: "db_user",
		DB_PASSWORD: "db_password",
		DB_DATABASE: "zmaj_db",
		DB_HOST: "localhost",
		DB_PORT: "5432",
		"# Email. Optional, but needed if you want Zmaj to send emails (password reset...)": "",
		EMAIL_ENABLED: "true",
		EMAIL_USER: "noreply@example.com",
		EMAIL_PASSWORD: "password",
		EMAIL_HOST: "localhost",
		EMAIL_PORT: "1025",
	}
	const stringEnv = Object.entries(env)
		.map(([key, val]) => (key.startsWith("#") ? key : `${key}=${val}`))
		.join("\n")

	await fse.writeFile(path.join(folderName, ".env"), stringEnv, { encoding: "utf-8" })

	note(
		[
			"Enter",
			pc.bold("cd " + folderName.replaceAll(" ", "\\ ")),
			pc.bold("npm install"),
			pc.bold("npm run dev"),
		].join("\n"),
		"To run server",
	)
	outro("All done!")
}
