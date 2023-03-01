export class SdkError extends Error {
	constructor(message?: string, options?: ErrorOptions) {
		super(message, options)
		this.initName()
	}

	initName(): void {
		this.name = this.constructor.name
	}
}
