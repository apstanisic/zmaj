export class AdminPanelError extends Error {
	constructor(
		public override message: string,
		stack?: any,
	) {
		super()
		this.name = "Admin Panel error"
		this.stack = stack
	}
}
