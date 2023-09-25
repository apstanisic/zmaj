import { BaseRepoMethodParams } from "./BaseRepoMethodParams"

export type RawQueryOptions = BaseRepoMethodParams & {
	params?: readonly any[] | Readonly<Record<string, number | unknown>>
}
