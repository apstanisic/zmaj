import { Button } from "@admin-panel/ui/Button"
import { MdSearch } from "react-icons/md"

export function FilterSubmitButton(): JSX.Element {
	return (
		<div className="flex w-full justify-end">
			<Button outline type="submit" endIcon={<MdSearch />}>
				Apply Filter
			</Button>
		</div>
	)
}
