import { useRecord } from "@admin-panel/hooks/use-record"
import { CircularProgress } from "@admin-panel/ui/CircularProgress"
import { isNil, notNil } from "@zmaj-js/common"
import { RecordContextProvider, ResourceContextProvider, useReference } from "ra-core"
import { ReactNode } from "react"
import { MdError } from "react-icons/md"

type ReferenceFieldProps = {
	// Fk source
	source: string
	// Collection it's pointing to
	reference: string
	empty?: ReactNode
	children: ReactNode
}

/**
 *
 */
export function ManyToOneReference(props: ReferenceFieldProps) {
	const record = useRecord()
	const fkValue = record?.[props.source]

	const referenceResult = useReference({
		id: fkValue,
		reference: props.reference,
		// call only if fk provided
		options: { enabled: notNil(fkValue) },
	})

	if (isNil(fkValue)) {
		return <>{props.empty ?? <p className="text-warning">-</p>}</>
	}

	if (referenceResult.error) {
		return (
			<div className="center h-full w-full">
				<MdError className="text-error" />
			</div>
		)
	}

	if (referenceResult.isLoading || !referenceResult.referenceRecord) {
		return (
			<div className="center h-full w-full">
				<CircularProgress size="20px" className="text-accent" />
			</div>
		)
	}

	return (
		<ResourceContextProvider value={props.reference}>
			<RecordContextProvider value={referenceResult.referenceRecord}>
				{props.children}
			</RecordContextProvider>
		</ResourceContextProvider>
	)
}
