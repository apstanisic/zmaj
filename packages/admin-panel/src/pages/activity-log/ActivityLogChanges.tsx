import { useRecord } from "@admin-panel/hooks/use-record"
import { Table } from "@admin-panel/ui/Table"
import { ActivityLog, ignoreErrors, isNil } from "@zmaj-js/common"
import { clsx } from "clsx"
import { applyPatch } from "fast-json-patch"
import { isDate, mapValues, unique } from "radash"
import { memo, useMemo } from "react"

export const ActivityLogChanges = memo(() => {
	const record = useRecord<ActivityLog>()

	const previous = useMemo(
		() => mapValues(record?.previousData ?? {}, (v) => (isDate(v) ? v.toJSON() : v)),
		[record?.previousData],
	)
	const current = useMemo(
		() =>
			ignoreErrors(
				() =>
					applyPatch(structuredClone(previous), (record?.changes ?? []) as any[], true, false)
						.newDocument,
			),
		[record?.changes, previous],
	)

	const fields = useMemo(
		() => unique(Object.keys(previous).concat(Object.keys(current ?? {}))),
		[current, previous],
	)

	if (!current) return <span className="text-red-500">Change info improperly stored</span>

	return (
		<div className="mt-5">
			<Table>
				<Table.Head>
					<Table.HeaderRow>
						<Table.HeaderColumn align="left">Field</Table.HeaderColumn>
						<Table.HeaderColumn align="left">Before</Table.HeaderColumn>
						<Table.HeaderColumn align="left">After</Table.HeaderColumn>
					</Table.HeaderRow>
				</Table.Head>
				<Table.Body>
					{fields.map((key, i) => {
						const oldV = previous[key]
						const newV = current[key]

						const isAdd = isNil(oldV) && !isNil(newV)
						const isDel = !isNil(oldV) && isNil(newV)
						const isSame = oldV === newV
						const isEdit = !isNil(oldV) && !isNil(newV)
						return (
							<Table.Row
								key={i}
								className={
									isAdd
										? "bg-green-100 dark:bg-green-800"
										: isDel
										? "bg-red-100 dark:bg-red-800"
										: isSame
										? "bg-blue-50 dark:bg-blue-800"
										: isEdit
										? "bg-yellow-100 dark:bg-yellow-700"
										: "bg-gray-100 dark:bg-stone-700"
								}
							>
								<Table.Column className="font-semibold">{key}</Table.Column>
								<Table.Column
									className={clsx("max-w-xs !whitespace-normal", isNil(oldV) && "text-blue-600")}
								>
									<>{isNil(oldV) ? "NULL" : oldV}</>
								</Table.Column>
								<Table.Column
									className={clsx("max-w-xs !whitespace-normal", isNil(newV) && "text-blue-600")}
								>
									<>{isNil(newV) ? "NULL" : newV}</>
								</Table.Column>
							</Table.Row>
						)
					})}
				</Table.Body>
			</Table>
		</div>
	)
})
