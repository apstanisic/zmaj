import { MjmlSpacer, MjmlText } from "@faire/mjml-react"
import { jsxToString } from "./shared/jsx-to-string"
import { Wrapper } from "./shared/Wrapper"

export function MagicLinkForbidden() {
	return (
		<Wrapper>
			<MjmlText fontSize="16px">
				You are not allowed to sign in currently. Please contact us if you need more info.
			</MjmlText>
			<MjmlSpacer />
		</Wrapper>
	)
}

export default jsxToString(<MagicLinkForbidden />)
