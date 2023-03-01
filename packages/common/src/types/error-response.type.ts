export type ErrorResponse = {
	error: {
		// when error ocurred
		timestamp: number
		// http code
		statusCode: number
		// error message
		message: string
		// internal error code
		errorCode?: number
		// additional details about error
		details?: string | any
	}
}
