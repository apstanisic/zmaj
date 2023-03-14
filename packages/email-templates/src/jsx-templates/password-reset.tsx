import { MjmlButton, MjmlSpacer, MjmlText } from "@faire/mjml-react"
import { jsxToString } from "./shared/jsx-to-string"
import { Wrapper } from "./shared/Wrapper"

export function PasswordReset() {
	return (
		<Wrapper>
			<MjmlText fontSize="16px">
				You have requested to reset password. Click on button bellow to enter new password. If you
				didn't request password reset, you can ignore this email.
			</MjmlText>
			<MjmlSpacer />
			<MjmlButton backgroundColor="#1338BE" borderRadius="8px" href="$ZMAJ_URL">
				Set new password
			</MjmlButton>
			<MjmlSpacer />
			<MjmlText fontSize="16px">Or copy and paste this URL in browser:</MjmlText>
			<MjmlText>$ZMAJ_URL</MjmlText>
		</Wrapper>
	)
}

export default jsxToString(<PasswordReset />)
