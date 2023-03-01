import { memo } from "react"
import { MdCheckCircleOutline, MdOutlineCancel } from "react-icons/md"

export const DisplayBooleanValue = memo(({ value }: { value: boolean }) => {
	return (
		<div className="flex items-center">
			{value ? (
				<MdCheckCircleOutline className="text-green-600 dark:text-green-500" />
			) : (
				<MdOutlineCancel className="text-red-600 dark:text-red-500" />
			)}
			<span className="ml-2">{value ? "Yes" : "No"}</span>
		</div>
	)
})
