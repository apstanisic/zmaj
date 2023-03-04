import { DataTypes, ModelAttributeColumnOptions, Sequelize } from "sequelize"

export function getRequiredColumns(): Record<"id" | "created_at", ModelAttributeColumnOptions> {
	return {
		id: { type: DataTypes.UUID, primaryKey: true },
		created_at: { type: DataTypes.DATE(3), allowNull: false, defaultValue: DefaultNow },
	}
}

export const DefaultNow = Sequelize.fn("NOW")
