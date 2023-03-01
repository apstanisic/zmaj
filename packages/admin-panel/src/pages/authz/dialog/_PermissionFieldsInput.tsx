import { Checkbox } from "@admin-panel/ui/Checkbox"
import { Divider } from "@admin-panel/ui/Divider"
import { List } from "@admin-panel/ui/List"
import { isNil } from "@zmaj-js/common"
import { diff, isArray } from "radash"
import { useFormContext, useWatch } from "react-hook-form"

type PermissionFieldsInput = {
	fields: string[]
}

export function PermissionFieldsInput(props: PermissionFieldsInput): JSX.Element {
	const { setValue } = useFormContext<{ fields?: string[] | null }>()
	const allFields = props.fields
	const allowedFields = useWatch({ name: "fields" })

	return (
		<List>
			<List.Item
				end={
					<Checkbox
						// edge="end"
						// it's checked only if value is null,
						// because if all fields are specified, in the future if field is added,
						// user won't have auto access to that fields
						isSelected={isNil(allowedFields)}
						// It's between if field is not nil (all fields allowed),
						// not empty array (no fields allowed)
						// ignore if all fields are manually selected, since that is not the same as null
						isIndeterminate={isArray(allowedFields) && allowedFields.length !== 0}
						onChange={(selected) => setValue("fields", selected ? null : [])}
						aria-label="Select all"
					/>
				}
			>
				Select all
			</List.Item>
			<Divider className="my-1" />
			<List className="h-[400px] max-h-[400px] overflow-auto">
				{allFields?.map((field, i) => (
					<List.Item
						key={i}
						end={
							<Checkbox
								// className="ml-4"
								// edge="end"
								aria-label="Select row"
								isSelected={isNil(allowedFields) || allowedFields.includes(field)}
								onChange={(checked) => {
									// const checked = e.currentTarget.checked

									if (checked) {
										// `fields` will never be null, cause if it's null, all values are already checked
										// but just to satisfy ts compiler
										// const withNewField = [...allowedFields!, field]
										setValue("fields", allowedFields!.concat(field))
									} else {
										// uncheck
										// fallback to all fields if val is nul (that means all selected)
										const selectedFields: string[] = allowedFields ?? allFields
										setValue("fields", diff(selectedFields, [field]))
									}
								}}
							/>
						}
					>
						{field}
					</List.Item>
				))}
			</List>
		</List>
	)
}
