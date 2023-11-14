import { ListItemButton, ListV2 } from "@admin-panel/ui/List"
import { Pagination } from "@admin-panel/ui/Pagination"
import { Tooltip } from "@admin-panel/ui/Tooltip"
import { templateParser, truncate } from "@zmaj-js/common"
import { clsx } from "clsx"
import { RaRecord, useChoicesContext } from "ra-core"
import { isInt } from "radash"
import { memo } from "react"
import { MdRadioButtonChecked, MdRadioButtonUnchecked } from "react-icons/md"

export type ChoicesPickerProps = {
	onClick: (record: RaRecord) => unknown
	template?: string
	className?: string
	isSelected?: (record: RaRecord) => boolean
}

export function ChoicesPicker(props: ChoicesPickerProps): JSX.Element {
	const { onClick, template, className, isSelected } = props
	const choices = useChoicesContext()

	return (
		<div
			className={clsx(
				"flex flex-1 flex-grow flex-col items-stretch justify-between",
				className,
			)}
		>
			<ListV2
				divider
				items={choices.availableChoices}
				getKey={(choice) => choice.id}
				render={(record) => {
					const selected =
						isSelected?.(record) ??
						choices.selectedChoices.some(
							(sel: RaRecord | undefined) => sel?.id === record.id, //
						)

					return (
						<ListItemButton
							onPress={() => onClick(record)}
							end={
								<Tooltip
									text={
										selected
											? `Deselect ${truncate(record.id, { length: 10 })}`
											: `Select ${truncate(record.id, { length: 10 })}`
									}
								>
									{selected ? (
										<MdRadioButtonChecked />
									) : (
										<MdRadioButtonUnchecked />
									)}
								</Tooltip>
							}
						>
							<p className="truncate">
								{templateParser.parse(template ?? "", record ?? {}, {
									fallback: record.id,
								})}
							</p>
						</ListItemButton>
					)
				}}
			/>

			<ChoicesPagination />
		</div>
	)
}

const ChoicesPagination = memo(() => {
	const choices = useChoicesContext()

	return (
		<Pagination
			page={isInt(choices.page) ? choices.page : 1}
			perPage={choices.perPage}
			total={choices.total ?? 0}
			hidePerPage
			setPage={(p) => choices.setPage(p)}
		/>
	)
})
