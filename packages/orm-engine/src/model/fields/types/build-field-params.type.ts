/**
 * This are params that user can pass to configure field
 */
export type BuildFieldParams = {
	nullable?: boolean
	canRead?: boolean
	canUpdate?: boolean
	canCreate?: boolean
	hasDefault?: boolean
	isPk?: boolean
	columnName?: string
	/** @internal */
	isUnique?: boolean
	/** @internal */
	isAutoIncrement?: boolean
	/** @internal */
	isCreatedAt?: boolean
	/** @internal */
	isUpdatedAt?: boolean
}
