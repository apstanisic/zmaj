import { MjmlColumn, MjmlDivider, MjmlSection } from "@faire/mjml-react"

export function Footer(): JSX.Element {
	return (
		<MjmlSection>
			<MjmlColumn>
				<MjmlDivider borderColor="#555" borderWidth="1px"></MjmlDivider>
			</MjmlColumn>
		</MjmlSection>
	)
}
