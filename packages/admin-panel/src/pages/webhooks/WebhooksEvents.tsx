import { Table } from "@admin-panel/ui/Table"
import { IconButton } from "@admin-panel/ui/buttons/IconButton"
import { useMemo } from "react"
import { MdCheck, MdClose } from "react-icons/md"
import { useUserCollections } from "../../hooks/use-user-collections"

type WebhooksEventsProps = {
	events?: readonly string[]
	/** If no `onClick` handler is provided, it will be read only (show screen) */
	onClick?: (event: string, newValue: boolean) => unknown
}

export function WebhooksEvents(props: WebhooksEventsProps) {
	const col = useUserCollections()

	const webhookCollections = useMemo(() => col.map((c) => c.collectionName), [col])

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
				{webhookCollections.map((collection, i) => (
					<Table.Row key={i}>
						<Table.Column>{collection}</Table.Column>
						{["create", "update", "delete"].map((action: string, i) => (
							<Table.Column width="100px" key={i}>
								{/* If passed on click handler, it will be a button */}
								<EventButton {...props} action={action} collection={collection} />
							</Table.Column>
						))}
					</Table.Row>
				))}
			</Table.Body>
		</Table>
	)
}

function EventButton(props: WebhooksEventsProps & { action: string; collection: string }) {
	const { action, collection, events, onClick } = props

	if (!onClick) {
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
			aria-label={`${checked ? "Disable" : "Enable"} event ${event}`}
			onPress={() => props.onClick?.(`${action}.${collection}`, !checked ?? true)}
			className="mx-auto"
		>
			{checked ? <MdCheck color="success" data-testid="CheckIcon" /> : <MdClose />}
		</IconButton>
	)
}
