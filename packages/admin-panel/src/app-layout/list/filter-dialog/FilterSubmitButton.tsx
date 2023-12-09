import { Button } from "@admin-panel/ui/buttons/Button"
import { MdSearch } from "react-icons/md"

export function FilterSubmitButton() {
	return (
		<div className="flex w-full justify-end">
			<Button variant="outlined" type="submit" endIcon={<MdSearch />}>
				Apply Filter
			</Button>
		</div>
	)
}
