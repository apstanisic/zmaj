import { List } from "@admin-panel/ui/List"
import { Tooltip } from "@admin-panel/ui/Tooltip"
import { cn } from "@admin-panel/utils/cn"
import { isStruct, templateParser } from "@zmaj-js/common"
import { RaRecord, useChoicesContext } from "ra-core"
import { Fragment, ReactNode } from "react"
import { MdRadioButtonChecked, MdRadioButtonUnchecked } from "react-icons/md"
import { ReferencePickerDialogPagination } from "./ReferencePickerDialogPagination"

export type ChoicesPickerProps = {
	template?: string
	className?: string
	renderAvatar?: (record: RaRecord) => ReactNode
	onSelect: (record: RaRecord) => unknown
}

export function ReferencePickerDialogContent(props: ChoicesPickerProps): JSX.Element {
	const { template, className, onSelect, renderAvatar } = props
	const choices = useChoicesContext()

	// console.log({ choices })

	return (
		<div
			className={cn(
				"flex flex-1 flex-grow flex-col items-stretch justify-between",
				className,
			)}
		>
			<List className="my-4" divider>
				{choices.availableChoices?.map((record: RaRecord, i) => {
					if (!isStruct(record)) return <Fragment key={i}></Fragment>

					const selected = choices.selectedChoices.some(
						(sel: RaRecord | undefined) => sel?.id === record.id, //
					)

					const item = (
						<List.ButtonItem
							type="button"
							noPadding
							key={record.id}
							className={"px-1 py-2 gap-x-4"}
							onClick={() => onSelect(record)}
							end={
								selected ? (
									<Tooltip text="Currently selected">
										<MdRadioButtonChecked />
									</Tooltip>
								) : (
									<MdRadioButtonUnchecked className="opacity-30" />
								)
							}
							start={renderAvatar?.(record)}
						>
							<div className="truncate">
								{templateParser.parse(template ?? "", record ?? {}, {
									fallback: record.id,
								})}
							</div>
						</List.ButtonItem>
					)
					return item
				})}
			</List>
			<ReferencePickerDialogPagination />
		</div>
	)
}
