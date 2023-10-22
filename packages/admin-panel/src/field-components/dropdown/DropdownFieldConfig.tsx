import { ArrayInput } from "@admin-panel/shared/input/ArrayInput"
import { Table } from "@admin-panel/ui/Table"
import { DropdownChoices } from "@zmaj-js/common"
import { isEmpty, trim } from "radash"
// import { useSimpleFormIterator } from "ra-core"
import { FormTextInput } from "@admin-panel/ui/Controlled"
import { useRef } from "react"
import { z } from "zod"
import { ManualShowField } from "../../shared/show/ManualShowField"
import { InputWrapper } from "../../ui/InputWrapper"

const ChoicesSchema = z.array(z.object({ value: z.unknown(), label: z.string().optional() }))

export const DropdownInputConfig = (): JSX.Element => {
	const buttonRef = useRef<HTMLButtonElement | null>(null)
	return (
		<InputWrapper
			label="Choices"
			required={false}
			labelProps={{
				onClick: () => buttonRef.current?.focus(),
			}}
		>
			<div className="input">
				<ArrayInput
					defaultValue={{ label: "", value: "" }}
					source="fieldConfig.component.dropdown.choices"
					render={(n, v) => (
						<div className="gap-2 md:flex ">
							<FormTextInput
								isRequired
								name={n + ".value" ?? "_"}
								value={v.value}
								label="Value"
							/>

							<FormTextInput
								name={n + ".label" ?? "_"}
								value={v.label}
								label="Label"
							/>
						</div>
					)}
				/>
			</div>
		</InputWrapper>
	)
}

export const DropdownShowConfig = (): JSX.Element => {
	return (
		<ManualShowField
			source="fieldConfig.component.dropdown.choices"
			label="Available Choices"
			render={(props) => {
				ChoicesSchema
				const valid = DropdownChoices.safeParse(props.value ?? [])
				// ChoicesSchema.safeParse(props.value ?? [])
				if (!valid.success) return <div className="text-error-content">Invalid Value</div>
				if (isEmpty(valid.data)) return <div className="text-warning-content">No value</div>
				return (
					<Table noBorder>
						<Table.Head>
							<Table.Row>
								<Table.Column>Value</Table.Column>
								<Table.Column>Label</Table.Column>
							</Table.Row>
						</Table.Head>
						<Table.Body>
							{valid.data?.map((row, i) => {
								const value = trim(JSON.stringify(row.value), '"')
								return (
									<Table.Row key={i}>
										<Table.Column>{value}</Table.Column>
										<Table.Column>{row.label ?? value}</Table.Column>
									</Table.Row>
								)
							})}
						</Table.Body>
					</Table>
				)
			}}
		/>
	)
}
