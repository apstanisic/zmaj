export type NameTransformer = (params: {
	key: string
	type: "column" // | "table" //
}) => string
