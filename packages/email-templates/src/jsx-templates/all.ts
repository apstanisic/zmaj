import confirmEmail from "./confirm-email"
import emailChange from "./email-change"
import inviteUser from "./invite-user"
import magicLink from "./magic-link"
import magicLinkForbidden from "./magic-link-forbidden"
import magicLinkNoAccount from "./magic-link-no-account"
import passwordReset from "./password-reset"
import passwordResetForbidden from "./password-reset-forbidden"

/**
 * This will be compiled to JSON,
 * so we can simply import it during runtime
 */
export const allTemplates = {
	confirmEmail,
	emailChange,
	inviteUser,
	magicLink,
	magicLinkForbidden,
	magicLinkNoAccount,
	passwordReset,
	passwordResetForbidden,
}
