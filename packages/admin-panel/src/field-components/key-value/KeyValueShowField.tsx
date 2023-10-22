import { Table } from "@admin-panel/ui/Table"
import { RenderShowField } from "../../shared/show/RenderShowField"
import { ShowFieldProps } from "../types/ShowFieldProps"

export const KeyValueShowField = (props: ShowFieldProps): JSX.Element => {
	return (
		<RenderShowField
			{...props}
			render={(fieldProps) => {
				const empty = Object.keys(fieldProps.value).length === 0
				if (empty) return <p className="text-md no-show-value">No Values (Empty Object)</p>

				return (
					<Table noBorder>
						<Table.Head>
							<Table.Row>
								<Table.Column className="font-bold text-base-200-content/70 text-sm">
									Key
								</Table.Column>
								<Table.Column className="font-bold text-base-200-content/70 text-sm">
									Value
								</Table.Column>
							</Table.Row>
						</Table.Head>
						<Table.Body>
							{Object.entries(fieldProps.value).map(([key, value], i) => (
								<Table.Row key={i}>
									<Table.Column>{String(key)}</Table.Column>
									<Table.Column>{String(value)}</Table.Column>
								</Table.Row>
							))}
						</Table.Body>
					</Table>
				)
			}}
		/>
	)
}
