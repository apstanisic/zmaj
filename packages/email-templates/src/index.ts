import { readFileSync } from "fs"
import { join } from "path"

type SharedParams = { ZMAJ_APP_NAME: string }
type ParamsWithUrl = SharedParams & { ZMAJ_URL: string }

function injectValues<T extends Record<string, string> = Record<string, string>>(
	template: string | undefined,
	params: T,
): string {
	if (template === undefined) throw new Error("Invalid Email template")
	for (const [key, val] of Object.entries(params)) {
		template = template.replaceAll("$" + key, val)
	}
	return template
}

// We do not have access to templates.json
let templates: (typeof import("./jsx-templates/all"))["allTemplates"]
try {
	templates = JSON.parse(
		readFileSync(join(__dirname, "../dist/templates.json"), { encoding: "utf-8" }),
	)
} catch (error) {
	templates ??= {} as never
}

export const emailTemplates = {
	magicLink: (params: ParamsWithUrl) => injectValues(templates.magicLink, params),
	magicLinkForbidden: (params: SharedParams) => injectValues(templates.magicLinkForbidden, params),
	magicLinkNoAccount: (params: SharedParams) => injectValues(templates.magicLinkNoAccount, params),
	confirmEmail: (params: ParamsWithUrl) => injectValues(templates.confirmEmail, params),
	emailChange: (params: ParamsWithUrl) => injectValues(templates.emailChange, params),
	inviteUser: (params: ParamsWithUrl) => injectValues(templates.inviteUser, params),
	passwordReset: (params: ParamsWithUrl) => injectValues(templates.passwordReset, params),
	passwordResetForbidden: (params: SharedParams) =>
		injectValues(templates.passwordResetForbidden, params),
}
