import { useRecord } from "@admin-panel/hooks/use-record"
import { Dialog } from "@admin-panel/ui/Dialog"
import { HighlightCode } from "@admin-panel/ui/HighlightedCode"
import { ResponsiveButton } from "@admin-panel/ui/buttons/ResponsiveButton"
import { useMemo, useState } from "react"
import { MdCode } from "react-icons/md"

/**
 * Renders button that when clicked shows Record as JSON
 */
export function ShowRecordAsJsonDialog() {
	const record = useRecord()
	const [visible, setVisible] = useState(false)

	const code = useMemo(() => JSON.stringify(record ?? {}, null, 4), [record])

	return (
		<>
			<ResponsiveButton icon={<MdCode />} label="JSON" onPress={() => setVisible(true)} />
			<Dialog open={visible} onClose={setVisible} className="flex max-w-3xl">
				<HighlightCode wrap code={code} language="json" />
			</Dialog>
		</>
	)
}
