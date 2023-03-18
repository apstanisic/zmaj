import { useRecord } from "@admin-panel/hooks/use-record"
import { get, isString, title } from "radash"
import { memo } from "react"
import { useSearchParams } from "react-router-dom"
import { useActionContext } from "../../context/action-context"
import { useCollectionContext } from "../../context/collection-context"
import { useFieldContext } from "../../context/field-context"
import { getFieldWidthCss } from "../../crud-layouts/get-field-width-css"
import { fieldComponents } from "../../field-components/field-components"
import { CommonFieldProps } from "../../field-components/types/CommonFieldProps"
import { useIsAllowed } from "../../hooks/use-is-allowed"
import { throwInApp } from "../../shared/throwInApp"

/**
 * Renders single field for resource
 *
 * This component requires 3 or 4 context providers
 * 1. RecordContext with record data. RA provides this, or user can manually provide,
 *    not required for input forms, since they expect values inside a rff context.
 *    It's still recommended to provide record, as field can still request it
 * 2. ActionContext so that it knows what action it is
 * 3. FieldContext so it can get info about type of field
 * 4. Input field expect to be inside `react-final-form` context, so it can access form
 *
 * This can be used outside of RA if all context providers exists
 * @returns field component
 */
export const GeneratedField = memo(() => {
	const [searchParams] = useSearchParams()

	const record = useRecord()
	const action = useActionContext()
	const field = useFieldContext() ?? throwInApp("5876234")
	const collection = useCollectionContext()
	// we check only if action is allowed, since we already check if "read" is allowed on server
	const actionAllowed = useIsAllowed(action, collection, field.fieldName)

	let Components = fieldComponents.get(field.componentName, field.dataType)

	// It won't allow to render incompatible types
	if (!Components.availableFor.includes(field.dataType)) {
		Components = fieldComponents.get(null, field.dataType)
		// throw new AdminPanelError("#9621")
	}

	const className = getFieldWidthCss(field.fieldConfig.width ?? 12)

	const source = field.fieldName

	const sharedProps: Omit<CommonFieldProps, "action" | "customProps"> = {
		label: field.label ?? title(source),
		source,
		record,
		// this allows to get nested value directly `get(data, 'post.user.email')`
		value: get(record, source),
		fieldConfig: field.fieldConfig,
		description: field.description ?? undefined,
		className,
	}

	// ---------------------------
	// List
	// ---------------------------
	if (action === "list")
		return (
			<Components.List
				{...sharedProps}
				action={action}
				displayTemplate={field.displayTemplate ?? undefined}
			/>
		)

	// ---------------------------
	// Show
	// ---------------------------
	if (action === "show")
		return (
			<Components.Show
				action="show"
				{...sharedProps}
				displayTemplate={field.displayTemplate ?? undefined}
			/>
		)

	// ---------------------------
	// Input (Create/Edit/Filter)
	// ---------------------------

	// User can disable field with query. This is only useful for UI, since backend still works the same
	const disabledWithQuery = searchParams.get(`disable_${source}`) === "true"

	const disabled =
		!actionAllowed ||
		disabledWithQuery ||
		field.isPrimaryKey ||
		// field.columnName === "id" ||
		(action === "create" ? !field.canCreate : !field.canUpdate)

	// we are settings this as placeholder, since db default value could sometimes not be valid
	// for example, we can't pass CURRENT_TIMESTAMP as date
	const defaultValue: string | undefined = isString(field.dbDefaultValue)
		? field.dbDefaultValue
		: // if null, we want to fallback to undefined
		  JSON.stringify(field.dbDefaultValue ?? undefined)

	// if there is default value, it's not required on create, but we only check nullable for update
	const required =
		field.isPrimaryKey || field.isUpdatedAt || field.isCreatedAt
			? false
			: action === "create" //
			? !field.isNullable && !field.hasDefaultValue
			: !field.isNullable

	return (
		<Components.Input
			{...sharedProps}
			action={action}
			className={className}
			isRequired={required}
			// defaultValue={field.dbDefaultValue}
			disabled={disabled}
			// We are passing default value as placeholder since it's db job to populate those values
			placeholder={defaultValue}
		/>
	)
})
