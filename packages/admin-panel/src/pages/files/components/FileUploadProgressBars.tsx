import { ProgressBar } from "@admin-panel/ui/Progress"
import { clsx } from "clsx"

/**
 * All file upload progress bars
 *
 * It does not render anything if upload is not in progress
 */
export function FileUploadProgressBars({ progress }: { progress: number[] }) {
	if (progress.length === 0) return <></>
	return (
		<div className="absolute inset-0 z-20 overflow-auto rounded-sm bg-gray-100 px-2 py-3 dark:bg-stone-900">
			{progress.map((value, i) => (
				<SingleProgress progress={value} key={i} />
			))}
		</div>
	)
}
/**
 * Single progress bar
 */
function SingleProgress({ progress }: { progress: number }) {
	return (
		<ProgressBar
			label="File upload progress"
			value={progress}
			variant={progress === 100 ? "success" : "info"}
			className={clsx("my-4 h-3", progress === -1 && "bg-error")}
		/>
	)
	// return (
	// 	<Progress
	// 		ariaLabel="File upload progress"
	// 		percent={progress}
	// 		// variant="determinate"
	// 		variant={progress === 100 ? "success" : undefined}
	// 		className={clsx("mx-auto my-4 h-3 overflow-hidden rounded-sm ", {
	// 			"bg-red-700": progress === -1,
	// 		})}
	// 	/>
	// )
}
