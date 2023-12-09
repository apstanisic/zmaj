import { MjmlColumn, MjmlDivider, MjmlSection, MjmlText } from "@faire/mjml-react"

export function Header() {
	return (
		<MjmlSection>
			<MjmlColumn>
				<MjmlText font-size="26px" align="center">
					$ZMAJ_APP_NAME
				</MjmlText>
				<MjmlDivider border-color="#F45E43"></MjmlDivider>
			</MjmlColumn>
		</MjmlSection>
	)
}
