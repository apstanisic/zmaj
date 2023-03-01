import { useRecord } from "@admin-panel/hooks/use-record"
import { CircularProgress } from "@admin-panel/ui/CircularProgress"
import { isNil, notNil } from "@zmaj-js/common"
import { clsx } from "clsx"
import {
	RecordContextProvider,
	ResourceContextProvider,
	useReference,
	useResourceDefinition,
} from "ra-core"
import { ReactNode } from "react"
import { MdError } from "react-icons/md"
import { useHref } from "react-router"

/**
 * Maybe switch to this, since react-admin's uses mui
 */

export function MyReferenceField(props: {
	className?: string
	reference: string
	source: string
	empty?: ReactNode
	children: ReactNode
}): JSX.Element {
	const record = useRecord()
	const val = record?.[props.source]
	const href = useHref({ pathname: `/${props.reference}/${val}/show` })
	const definition = useResourceDefinition({ resource: props.reference })
	const ref = useReference({
		id: val,
		reference: props.reference,
		options: { enabled: notNil(val) },
	})

	if (isNil(val)) {
		return <>{props.empty ?? <p className="text-warning">NULL</p>}</>
	}

	if (ref.error) {
		return (
			<div className="center h-full w-full">
				<MdError className="text-error" />
			</div>
		)
	}

	if (ref.isLoading || !ref.referenceRecord) {
		return (
			<div className="center h-full w-full">
				<CircularProgress size="20px" className="text-accent" />
			</div>
		)
	}

	return (
		<ResourceContextProvider value={props.reference}>
			<RecordContextProvider value={ref.referenceRecord}>
				{definition.hasShow ? (
					<a href={href} className={clsx("w-full font-bold text-accent", props.className)}>
						{props.children}
					</a>
				) : (
					<div className={props.className}>{props.children}</div>
				)}
			</RecordContextProvider>
		</ResourceContextProvider>
	)
}
