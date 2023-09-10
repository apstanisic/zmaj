export type PaginatedResponse<T> = {
	page: number
	totalPages: number
	totalItems: number
	isFirst: boolean
	isLast: boolean
	data: T[]
}
