import { Accordion } from "@admin-panel/ui/Accordion"
import { Divider } from "@admin-panel/ui/Divider"
import { ToggleButton } from "@admin-panel/ui/ToggleButton"
import { RelationCreateDto } from "@zmaj-js/common"
import { useWatch } from "react-hook-form"
import { ManualInputField } from "../../../shared/input/ManualInputField"
import { Columns } from "../../../ui/Columns"
import { FkOptionsInput } from "./FkOptionsInput"
import { JunctionOptions } from "./JunctionOptions"

export function AdvancedOptions(): JSX.Element {
	const type = useWatch<RelationCreateDto, "type">({ name: "type" })

	return (
		<>
			<Divider />

			<Accordion
				unmount={false}
				button={() => (
					<div className="mb-3 flex items-center gap-x-3">
						<Accordion.Button
							// it's adding deprecation warning since react-aria expects on press
							as={ToggleButton}
							aria-label="Show advanced"
							// labelPosition="right"
							// className="mb-5"
						></Accordion.Button>
						<span>Show Advanced</span>
					</div>
				)}
			>
				<Columns>
					<ManualInputField
						source="left.label"
						label="Label"
						description="Leave empty for default value"
					/>
					<ManualInputField
						source="right.label"
						label="Label (other side)"
						description="Leave empty for default value"
					/>
				</Columns>

				<Columns>
					<ManualInputField
						source="left.template"
						description="Leave empty for default value"
						label="Template"
					/>
					<ManualInputField
						source="right.template"
						description="Leave empty for default value"
						label="Template (other side)"
					/>
				</Columns>

				{type === "many-to-many" && <JunctionOptions />}
				<Columns>
					<FkOptionsInput type={type} />
				</Columns>
			</Accordion>
		</>
	)
}
