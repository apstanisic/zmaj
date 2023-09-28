import { DataTypes, QueryInterface, Sequelize, Transaction } from "sequelize"

const columns = {
	id: { type: DataTypes.UUID, primaryKey: true },
	created_at: { type: DataTypes.DATE(3), allowNull: false, defaultValue: Sequelize.fn("NOW") },
}

export async function createBlogTables(qi: QueryInterface, trx: Transaction): Promise<void> {
	await qi.createTable(
		"posts",
		{
			id: columns.id,
			created_at: columns.created_at,
			title: { type: DataTypes.STRING, allowNull: false },
			body: { type: DataTypes.TEXT, allowNull: false },
			likes: { type: DataTypes.INTEGER, allowNull: false },
		},
		{ transaction: trx },
	)

	await qi.createTable(
		"comments",
		{
			id: columns.id,
			body: { type: DataTypes.TEXT, allowNull: false },
			post_id: {
				allowNull: false,
				type: DataTypes.UUID,
				references: {
					model: "posts",
					key: "id",
				},
				onDelete: "CASCADE",
			},
		},
		{ transaction: trx },
	)

	await qi.createTable(
		"tags",
		{
			id: columns.id,
			name: { type: DataTypes.STRING, allowNull: false, unique: true },
		},
		{ transaction: trx },
	)

	await qi.createTable(
		"posts_tags",
		{
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
				autoIncrementIdentity: true,
			},
			post_id: {
				type: DataTypes.UUID,
				references: {
					model: "posts",
					key: "id",
				},
				onDelete: "CASCADE",
			},
			tag_id: {
				type: DataTypes.UUID,
				references: {
					model: "tags",
					key: "id",
				},
				onDelete: "CASCADE",
			},
		},
		{
			uniqueKeys: { post_tags_composite_unique: { fields: ["tag_id", "post_id"] } },
			transaction: trx,
		},
	)

	await qi.createTable(
		"posts_info",
		{
			id: columns.id,
			post_id: {
				type: DataTypes.UUID,
				references: {
					model: "posts",
					key: "id",
				},
				onDelete: "CASCADE",
			},
			additional_info: { type: DataTypes.JSONB },
		},
		{
			transaction: trx,
		},
	)
}
