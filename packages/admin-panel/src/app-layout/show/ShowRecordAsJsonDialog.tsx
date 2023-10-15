import { useRecord } from "@admin-panel/hooks/use-record"
import { Dialog } from "@admin-panel/ui/Dialog"
import { ResponsiveButton } from "@admin-panel/ui/buttons/ResponsiveButton"
import { useMemo, useState } from "react"
import { MdCode } from "react-icons/md"
import { useActionContext } from "../../context/action-context"
import { HighlightCode } from "../../field-components/code/HighlightCode"

/**
 * Renders button that when clicked shows Record as JSON
 */
export function ShowRecordAsJsonDialog(): JSX.Element {
	const record = useRecord()
	const action = useActionContext()
	const [show, setShow] = useState(false)

	const code = useMemo(() => JSON.stringify(record ?? {}, null, 4), [record])

	if (action !== "show") return <></>

	return (
		<>
			<ResponsiveButton icon={<MdCode />} label="JSON" onPress={() => setShow(true)} />
			<Dialog open={show} onClose={() => setShow(false)} className="flex max-w-3xl">
				<HighlightCode wrap code={code} language="json" className="" />
			</Dialog>
		</>
	)
}
