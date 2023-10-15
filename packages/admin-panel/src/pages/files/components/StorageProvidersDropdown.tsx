import { ToggleButton } from "@admin-panel/ui/buttons/ToggleButton"
import { SelectInput } from "@admin-panel/ui/forms/SelectInput"
import { useSelectedStorage } from "../hooks/use-selected-storage"

/**
 * Option to choose storage provider.
 * Disabled if user does not have permission, or there is only one provider
 */
export function StorageProvidersDropdown(): JSX.Element {
	// const storageInfo = useStorageInfo()
	const providers = ["hello", "world", "test"] // useAvailableStorageProviders().data
	const [selected, setSelected] = useSelectedStorage()

	if (providers.length < 2) return <div></div>
	return (
		<div className="flex gap-x-2">
			<SelectInput
				isDisabled={selected === null}
				aria-label="Pick storage"
				triggerClassName="min-w-[200px]"
				name="provider"
				// variant="outlined"
				options={
					selected === null
						? [{ value: "$$Default", label: "Default Provider" }]
						: providers.map((p) => ({ value: p }))
				}
				// value={selected ?? providers.at(0)!}
				value={selected ?? "$$Default"}
				isRequired
				// hideLabel
				onChange={(val) => {
					// setSelected(event.target.value)
					setSelected(val as string)
				}}
			/>
			<ToggleButton
				isSelected={selected !== null}
				aria-label="Enable provider selection"
				onChange={(value) => setSelected(value ? providers.at(0)! : null)}
			/>
		</div>
	)
}
