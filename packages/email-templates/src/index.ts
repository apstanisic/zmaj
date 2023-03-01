import { injectValues, readTemplate } from "./utils.js"

type SharedParams = { ZMAJ_APP_NAME: string }
type ParamsWithUrl = SharedParams & { ZMAJ_URL: string }

export const emailTemplates = {
	magicLink: (params: ParamsWithUrl) => injectValues(readTemplate("magic-link.html"), params),
	magicLinkForbidden: (params: SharedParams) =>
		injectValues(readTemplate("magic-link-forbidden.html"), params),
	magicLinkNoAccount: (params: SharedParams) =>
		injectValues(readTemplate("magic-link-no-account.html"), params),
	confirmEmail: (params: ParamsWithUrl) => injectValues(readTemplate("confirm-email.html"), params),
	emailChange: (params: ParamsWithUrl) => injectValues(readTemplate("email-change.html"), params),
	inviteUser: (params: ParamsWithUrl) => injectValues(readTemplate("invite-user.html"), params),
	passwordReset: (params: ParamsWithUrl) =>
		injectValues(readTemplate("password-reset.html"), params),
	passwordResetForbidden: (params: SharedParams) =>
		injectValues(readTemplate("password-reset-forbidden.html"), params),
}
