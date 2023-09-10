export type OrmLogger = {
	log(message: string, ...rest: any[]): void
	warn(message: string, ...rest: any[]): void
	error(message: string, ...rest: any[]): void
}
