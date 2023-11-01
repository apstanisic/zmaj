import { useRecord } from "@admin-panel/hooks/use-record"
import { RecordContextProvider, ResourceContextProvider, useGetList } from "ra-core"
import { Except } from "type-fest"
import { ManyToOneShowFieldProps } from "../many-to-one/ManyToOneShowField"
import { ManyToOneShowFieldRender } from "../many-to-one/ManyToOneShowFieldRender"
import { EmptyManyToOneShowField } from "../shared/EmptyManyToOneShowField"

export type RefOneToOneShowFieldProps = Except<ManyToOneShowFieldProps, "source"> & {
	target: string
	newTab?: boolean
}

export function RefOneToOneShowField(props: RefOneToOneShowFieldProps): JSX.Element {
	const { label, reference, target, className, template, description, newTab } = props
	const mainRecord = useRecord()

	// Since this is o2o, we only need first record
	const list = useGetList(
		reference,
		{ filter: { [target]: mainRecord?.id }, pagination: { page: 1, perPage: 1 } },
		{ enabled: !!mainRecord?.id },
	)
	const innerRecord = list.data?.[0]

	if (!innerRecord) return <EmptyManyToOneShowField label={label} className={className} />

	return (
		<ResourceContextProvider value={reference}>
			<RecordContextProvider value={innerRecord}>
				<ManyToOneShowFieldRender
					newTab={newTab}
					label={label}
					className={className}
					template={template}
					description={description}
				/>
			</RecordContextProvider>
		</ResourceContextProvider>
	)
}
