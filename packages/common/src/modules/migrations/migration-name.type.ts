type MigrationDate = `2${string}_${string}_${string}_${string}_${string}_${string}`

/**
 * Migration name must contain date to differentiate between migrations with the same name
 * There could be multiple migrations with same name
 */
export type DbMigrationName = `${MigrationDate}__${string}`
