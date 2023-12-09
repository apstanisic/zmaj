import { ShowFieldContainer } from "@admin-panel/shared/show/ShowFieldContainer"
import { Tooltip } from "@admin-panel/ui/Tooltip"
import { cn } from "@admin-panel/utils/cn"

export function EmptyManyToOneShowField(props: { label: string; className?: string }) {
	return (
		<ShowFieldContainer label={props.label} className={cn(props.className)}>
			<div className="flex">
				<Tooltip text="No record connected">
					<p className="text-warning pl-3 pr-8">-</p>
				</Tooltip>
			</div>
		</ShowFieldContainer>
	)
}
