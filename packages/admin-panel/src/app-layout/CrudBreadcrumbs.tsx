import { useRecord } from "@admin-panel/hooks/use-record"
import { useResourceDefinition } from "ra-core"
import { capitalize } from "radash"
import { useHref } from "react-router"
import { useActionContext } from "../context/action-context"

export function CrudBreadcrumbs() {
	const action = useActionContext()
	const resource = useResourceDefinition()
	const record = useRecord()
	const listHref = useHref({ pathname: "/" + resource.name })

	return (
		<div className="du-breadcrumbs">
			<ul>
				<li>
					{resource.hasList ? (
						<a className="text-primary" href={resource.hasList ? listHref : undefined}>
							{resource.options?.label ?? resource.name}
						</a>
					) : (
						resource.options?.label ?? resource.name
					)}
				</li>
				{record?.id ? (
					<li>
						<span className="mr-2">{capitalize(action)}</span>
						<span className="font-semibold "> {record.id}</span>
					</li>
				) : (
					<li>{capitalize(action)}</li>
				)}
			</ul>
		</div>
	)
}
