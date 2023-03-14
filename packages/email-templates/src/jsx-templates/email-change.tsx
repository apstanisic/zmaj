import { MjmlButton, MjmlSpacer, MjmlText } from "@faire/mjml-react"
import { jsxToString } from "./shared/jsx-to-string"
import { Wrapper } from "./shared/Wrapper"

function EmailChange(): JSX.Element {
	return (
		<Wrapper>
			<MjmlText fontSize="16px">Please click on button bellow to confirm email change.</MjmlText>
			<MjmlSpacer />
			<MjmlButton backgroundColor="#1338BE" borderRadius="8px" href="$ZMAJ_URL">
				Confirm email change
			</MjmlButton>
			<MjmlSpacer />
			<MjmlText fontSize="16px">Or copy and paste this URL in browser:</MjmlText>
			<MjmlText>$ZMAJ_URL</MjmlText>
		</Wrapper>
	)
}
export default jsxToString(<EmailChange />)
