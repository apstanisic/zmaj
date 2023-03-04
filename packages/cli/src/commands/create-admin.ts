import { isCancel, log, note, outro, password, text } from "@clack/prompts"
import { _cliUtils } from "@zmaj-js/api"
import { ADMIN_ROLE_ID, isEmail } from "@zmaj-js/common"
import pc from "picocolors"
import { processExit } from "../prompt-utils.js"
import { BaseYargs, envFilePrompt } from "../utils.js"

export function createAdminUserCommand(yr: BaseYargs): void {
	yr.command(
		"create-admin [email]",
		"Create Admin user",
		(y) =>
			y
				.positional("email", { type: "string", description: "Admin's email", demandOption: false })
				.option("password", {
					type: "string",
					demandOption: false,
					description:
						"Set password. This is not a recommended way. Omit this value to show prompt.",
				})
				.option("env-file", { type: "string", demandOption: false }),
		async (argv) => createAdmin(argv),
	)
}

async function createAdmin(cliParams: {
	email?: string
	envFile?: string
	usePasswordPassword?: boolean
}): Promise<void> {
	if (cliParams.email && !isEmail(cliParams.email)) processExit(1, "Invalid email")

	log.warn("Make sure that database is running")

	const email =
		cliParams.email ??
		(await text({
			message: "Enter admin email",
			placeholder: "admin@example.com",
			validate(value) {
				if (!isEmail(value)) return "Invalid email"
				return
			},
		}))

	if (isCancel(email)) processExit()

	const untrimmedPass = await password({
		message: "Enter admin password",
		validate(value) {
			if (value.trim().length < 8) return "Must be at least 8 characters"
			return
		},
	})
	if (isCancel(untrimmedPass)) processExit()
	const pass = untrimmedPass.trim()

	log.info("We need to have location of your .env file, so we can connect to the database")
	const { full: envPath } = await envFilePrompt(cliParams.envFile)

	try {
		await _cliUtils.createAdmin(envPath, {
			confirmedEmail: true,
			email,
			password: pass,
			firstName: "Admin",
			lastName: "User",
			roleId: ADMIN_ROLE_ID,
			status: "active",
		})

		note(
			"Email:".padEnd(12) + pc.bold(email) + "\n" + "Password:".padEnd(12) + pc.bold(pass),
			"User successfully created.",
		)
	} catch (error) {
		//
		console.log(pc.red(JSON.stringify(error, null, 4)))
		processExit(1, "Problem creating admin")
		return
	}

	outro("Success!")
}
