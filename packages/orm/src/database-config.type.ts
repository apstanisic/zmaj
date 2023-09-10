export type DatabaseConfig = {
	username: string
	password: string
	host: string
	database: string
	port: number
	type?: "postgres"
	logging?: boolean
}
