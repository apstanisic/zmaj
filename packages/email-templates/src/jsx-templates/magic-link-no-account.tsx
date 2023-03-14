import { MjmlSpacer, MjmlText } from "@faire/mjml-react"
import { jsxToString } from "./shared/jsx-to-string"
import { Wrapper } from "./shared/Wrapper"

export function MagicLinkNoAccount() {
	return (
		<Wrapper>
			<MjmlText fontSize="16px">
				You tried to sign in with your email. You currently do not have account with us. If this
				wasn't you, you can ignore this email.
			</MjmlText>
			<MjmlSpacer />
		</Wrapper>
	)
}

export default jsxToString(<MagicLinkNoAccount />)
