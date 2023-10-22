import { useOnInfraPropertyDelete } from "@admin-panel/hooks/use-on-infra-property-delete"
import { useInfraState } from "@admin-panel/state/useInfraState"
import { FormTextInput } from "@admin-panel/ui/Controlled"
import { RelationUpdateDto } from "@zmaj-js/common"
import { memo } from "react"
import { CustomInputLayout } from "../../crud-layouts/input"
import { GeneratedEditPage } from "../../generator/pages/GeneratedEditPage"
import { Columns } from "../../ui/Columns"

export const RelationEdit = memo(() => {
	const onDelete = useOnInfraPropertyDelete()
	const infra = useInfraState()
	return (
		<GeneratedEditPage
			disableDeleteRedirect
			onDelete={onDelete}
			onSuccess={async () => infra.refetch()}
			schema={RelationUpdateDto.zodSchema}
		>
			<CustomInputLayout>
				<FormTextInput name="type" isDisabled label="Type" />
				<Columns>
					<FormTextInput name="tableName" isDisabled label="Table name" />
					<FormTextInput
						name="otherSide.tableName"
						label="Table Name (other side)"
						isDisabled
					/>
				</Columns>
				<Columns>
					<FormTextInput name="columnName" isDisabled label="Column name" />
					<FormTextInput
						name="otherSide.columnName"
						label="Column Name (other side)"
						isDisabled
					/>
				</Columns>
				{/* don't make this full width, to signal it to the user that this is for the left side */}
				<div className="w-4/5 md:w-2/3">
					<FormTextInput name="relation.propertyName" label="Property Name" />
					<FormTextInput name="relation.label" label="Label" />
					<FormTextInput name="relation.template" label="Display Template" />
				</div>
			</CustomInputLayout>
		</GeneratedEditPage>
	)
})
