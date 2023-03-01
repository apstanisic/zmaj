import { isLastIndex, splitAndTrim } from "@zmaj-js/common"
import { memo } from "react"

export const DisplayCsvValue = memo(({ value }: { value: unknown }) => {
	let toShow: string[]
	if (Array.isArray(value)) {
		toShow = value.map((v) => String(v))
	} else if (typeof value === "string") {
		toShow = splitAndTrim(value)
		// toShow = value.split(",")
	} else {
		toShow = [String(value ?? "")]
	}

	return (
		<div className="flex w-full items-end gap-x-3 overflow-hidden truncate text-ellipsis">
			{toShow.map((item, i) => (
				<span key={i}>
					{item}
					{!isLastIndex(toShow, i) && <span className="text-2xl text-red-400">,</span>}
				</span>
			))}
		</div>
	)
})
