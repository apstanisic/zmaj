import { useRecord } from "@admin-panel/hooks/use-record"
import { CircularProgress } from "@admin-panel/ui/CircularProgress"
import {
	RecordContextProvider,
	useReferenceOneFieldController,
	UseReferenceOneFieldControllerParams,
	useResourceDefinition,
} from "ra-core"
import { ReactNode } from "react"
import { MdError } from "react-icons/md"
import { useHref } from "react-router"

/**
 * Maybe switch to this, since react-admin's uses mui
 */

export function MyReferenceOneField(
	props: UseReferenceOneFieldControllerParams & {
		empty?: ReactNode
		children: ReactNode
	},
) {
	const definition = useResourceDefinition({ resource: props.reference })
	const record = useRecord()

	const refField = useReferenceOneFieldController({ ...props, record })

	const href = useHref({ pathname: `/${props.reference}/${refField.referenceRecord?.id}/show` })

	if (!refField.referenceRecord) {
		return <>{props.empty ?? <p className="text-warning">NULL</p>}</>
	}

	if (refField.error) {
		return (
			<div className="center h-full w-full">
				<MdError className="text-error" />
			</div>
		)
	}

	if (refField.isLoading) {
		return (
			<div className="center h-full w-full">
				<CircularProgress size="20px" className="text-accent" />
			</div>
		)
	}

	return (
		// <ResourceContextProvider value={props.reference}>
		<RecordContextProvider value={refField.referenceRecord}>
			{definition.hasShow ? (
				<a href={href} className="w-full font-bold text-accent">
					{props.children}
				</a>
			) : (
				props.children
			)}
		</RecordContextProvider>
		// </ResourceContextProvider>
	)
}
