export type CursorPaginationResponse<T> = {
	previousCursor: string
	nextCursor: string
	isFirst: boolean
	isLast: boolean
	data: T[]
}
