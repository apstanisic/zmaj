import { MjmlSpacer, MjmlText } from "@faire/mjml-react"
import { jsxToString } from "./shared/jsx-to-string"
import { Wrapper } from "./shared/Wrapper"

export function PasswordResetForbidden() {
	return (
		<Wrapper>
			<MjmlText fontSize="16px">
				You can not reset password currently. Please contact us for more information.
			</MjmlText>
			<MjmlSpacer />
		</Wrapper>
	)
}

export default jsxToString(<PasswordResetForbidden />)
