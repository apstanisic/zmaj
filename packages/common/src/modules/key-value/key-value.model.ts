export type KeyValue = {
	/**
	 * Row ID
	 */
	id: string
	/**
	 * When was created
	 */
	createdAt: Date
	/**
	 * Key with which to get value
	 */
	key: string
	/**
	 * When was last time updated
	 */
	updatedAt: Date
	/**
	 * Value
	 */
	value: string | null
	/**
	 * In what namespace is this value
	 */
	namespace: string | null
}
