import knex from "knex"

/**
 * TODO
 * Used only as query builder when needed
 * @deprecated Discouraged, only if necessary
 */
export const knexQuery = knex({ client: "postgres" })
