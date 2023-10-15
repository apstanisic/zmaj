import { Button } from "@admin-panel/ui/buttons/Button"
import { MdSave } from "react-icons/md"
// import { SaveButton as SB, useSaveContext } from "ra-core"
import { useSaveContext } from "ra-core"
import { useFormContext } from "react-hook-form"

export function SaveButton(props: { className?: string }): JSX.Element {
	const save = useSaveContext()
	const form = useFormContext()

	return (
		<Button
			className={props.className}
			// isDisabled={save.saving || form.formState.isDirty !== true}
			isDisabled={save.saving}
			endIcon={<MdSave />}
			// onPress={() => save.save!(form.getValues())}
			type="submit"
		>
			Save
		</Button>
	)
}
