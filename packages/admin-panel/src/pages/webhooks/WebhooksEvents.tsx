import { IconButton } from "@admin-panel/ui/IconButton"
import { Table } from "@admin-panel/ui/Table"
import { camel } from "radash"
import { useMemo } from "react"
import { MdCheck, MdClose } from "react-icons/md"
import { useInfraTables } from "../../state/infra-state-v2"

type WebhooksEventsProps = {
	events?: readonly string[]
	onClick?: (event: string, newValue: boolean) => unknown
}

export function WebhooksEvents(props: WebhooksEventsProps): JSX.Element {
	const allTables = useInfraTables()

	const webhookCollections = useMemo(
		() => allTables.filter((t) => !t.startsWith("zmaj")).map((v) => camel(v)),
		[allTables],
	)

	if (props.events?.length === 0) {
		return <p className="text-xl text-center my-5">No Collections</p>
	}

	return (
		<Table>
			<Table.Head>
				<Table.Row>
					<Table.Column>Collection</Table.Column>
					{/* <Table.Column className="text-center">read</Table.Column> */}
					<Table.Column className="text-center">create</Table.Column>
					<Table.Column className="text-center">update</Table.Column>
					<Table.Column className="text-center">delete</Table.Column>
				</Table.Row>
			</Table.Head>
			<Table.Body>
				{/*  */}
				{webhookCollections.map((table, i) => (
					<Table.Row key={i}>
						<Table.Column>{table}</Table.Column>
						{["create", "update", "delete"].map((action: string, i) => (
							<Table.Column width="100px" key={i}>
								{/* If passed on click handler, it will be a button */}
								<EventButton {...props} action={action} collection={table} />
							</Table.Column>
						))}
					</Table.Row>
				))}
			</Table.Body>
		</Table>
	)
}

function EventButton(
	props: WebhooksEventsProps & { action: string; collection: string },
): JSX.Element {
	const { action, collection, events, onClick } = props

	if (onClick === undefined) {
		return events?.includes(`${action}.${collection}`) ? (
			<MdCheck color="success" className="my-1 mx-auto" data-testid="CheckIcon" />
		) : (
			<MdClose color="disabled" className="my-1 mx-auto" />
		)
	}
	const event = `${action}.${collection}`

	const checked = events?.includes(event)
	return (
		<IconButton
			label={`${checked ? "Disable" : "Enable"} event ${event}`}
			onClick={() => props.onClick?.(`${action}.${collection}`, !checked ?? true)}
			className="mx-auto"
		>
			{checked ? <MdCheck color="success" data-testid="CheckIcon" /> : <MdClose />}
		</IconButton>
	)
}
