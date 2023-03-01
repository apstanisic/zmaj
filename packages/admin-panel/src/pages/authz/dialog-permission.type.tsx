export type DialogPermission = {
	/**
	 * Action
	 */
	action: string
	/**
	 * Resource
	 */
	resource: string
	/**
	 * Fields that user is allowed now (null signals all fields)
	 */
	fields: string[] | null
	/**
	 * Fields that user can choose to allow (if it's null, there are no fields)
	 */
	availableFields: string[] | null
}
