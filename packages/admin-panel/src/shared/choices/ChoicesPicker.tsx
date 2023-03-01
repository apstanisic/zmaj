import { Avatar } from "@admin-panel/ui/Avatar"
import { DisplayZmajFile } from "@admin-panel/ui/display-file"
import { List } from "@admin-panel/ui/List"
import { Pagination } from "@admin-panel/ui/Pagination"
import { Tooltip } from "@admin-panel/ui/Tooltip"
import { FileInfo, isStruct, templateParser } from "@zmaj-js/common"
import { clsx } from "clsx"
import { RaRecord, useChoicesContext } from "ra-core"
import { isInt } from "radash"
import { Fragment, memo } from "react"
import { MdRadioButtonChecked } from "react-icons/md"

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
			className={clsx("flex flex-1 flex-grow flex-col items-stretch justify-between", className)}
		>
			<List className="my-4" divider>
				{choices.availableChoices.map((record: RaRecord, i) => {
					if (!isStruct(record)) return <Fragment key={i}></Fragment>

					const selected =
						isSelected?.(record) ??
						choices.selectedChoices.some(
							(sel: RaRecord | undefined) => sel?.id === record.id, //
						)

					const item = (
						<List.ButtonItem
							type="button"
							noPadding
							key={i}
							className={choices.resource === "zmajFiles" ? "py-1" : "px-1 py-2"}
							onClick={() => onClick(record)}
							end={
								selected ? (
									<Tooltip text="Currently selected">
										<MdRadioButtonChecked />
									</Tooltip>
								) : undefined
							}
							start={
								choices.resource === "zmajFiles" ? (
									<Avatar>
										<DisplayZmajFile file={record as FileInfo} size="thumbnail" />
									</Avatar>
								) : undefined
							}
						>
							{templateParser.parse(template ?? "", record ?? {}, { fallback: record.id })}
						</List.ButtonItem>
					)
					return template ? (
						<Tooltip text={record?.id ?? ""} key={i} side="top">
							{item}
						</Tooltip>
					) : (
						item
					)
				})}
			</List>
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
