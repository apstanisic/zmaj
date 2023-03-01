// https://www.mongodb.com/docs/v6.0/reference/operator/query-comparison/
export const comparisons = Object.freeze([
	// mongo filters
	"$eq", // equal
	"$ne", // not equal
	"$lt", // less than
	"$lte", // less than or equal
	"$gt", // greater than
	"$gte", // greater than or equal
	"$in", // is in
	"$nin", // not in
	// non mongo but has support in sequelize
	"$like",
	// "$regex", // maybe in the future
	// updated. Need to parse on server
	// "$exists", // is not null
] as const)

export type Comparison = typeof comparisons[number]
