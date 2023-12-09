import { Button } from "@admin-panel/ui/buttons/Button"
import { MdSave } from "react-icons/md"
// import { SaveButton as SB, useSaveContext } from "ra-core"
import { useFormState } from "react-hook-form"

export function SaveButton(props: { className?: string }) {
	const { isSubmitting, isDirty } = useFormState()

	return (
		<Button
			className={props.className}
			isDisabled={isSubmitting || !isDirty}
			endIcon={<MdSave />}
			type="submit"
		>
			Save
		</Button>
	)
}
