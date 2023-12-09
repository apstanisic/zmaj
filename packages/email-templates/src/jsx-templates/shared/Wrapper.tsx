import { Mjml, MjmlBody, MjmlColumn, MjmlSection } from "@faire/mjml-react"
import { Footer } from "./Footer"
import { Header } from "./Header"

export function Wrapper(props: { children: any }) {
	return (
		<Mjml>
			<MjmlBody backgroundColor="#FFFFFF">
				<Header />
				<MjmlSection>
					<MjmlColumn>{props.children}</MjmlColumn>
				</MjmlSection>
				<Footer />
			</MjmlBody>
		</Mjml>
	)
}
