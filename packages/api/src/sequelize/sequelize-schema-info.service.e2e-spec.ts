import { DatabaseConfig } from "@api/database/database.config"
import {
	SchemaInfoService,
	SingleUniqueKey,
	UniqueKey,
} from "@api/database/schema/schema-info.service"
import { ConfigService, systemCollections } from "@api/index"
import { allMockCollectionDefs, mockColumns, mockForeignKeys } from "@zmaj-js/test-utils"
import { objectify } from "radash"
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest"
import { SequelizeSchemaInfoService } from "./sequelize-schema-info.service"
import { SequelizeService } from "./sequelize.service"

describe("SequelizeSchemaInfoService", () => {
	let sqService: SequelizeService
	let schemaInfo: SchemaInfoService

	beforeAll(async () => {
		const configService = new ConfigService({
			envPath: ".env.test",
			throwOnNoEnvFile: true,
			useEnvFile: true,
			useProcessEnv: false,
			assignToProcessEnv: false,
		})
		const config = new DatabaseConfig({}, configService)

		sqService = new SequelizeService(config)
		await sqService.init(allMockCollectionDefs)
		schemaInfo = new SequelizeSchemaInfoService(sqService)
	})

	afterAll(async () => {
		await sqService.onModuleDestroy()
	})

	it("should compile", () => {
		expect(schemaInfo).toBeDefined()
	})

	describe("hasTable", () => {
		it("should check if table exists", async () => {
			const existing = await schemaInfo.hasTable("posts")
			expect(existing).toEqual(true)
			const nonExisting = await schemaInfo.hasTable("non_exist")
			expect(nonExisting).toEqual(false)
		})
	})

	describe("hasColumn", () => {
		it("should check if column exists", async () => {
			const existing = await schemaInfo.hasColumn("posts", "title")
			expect(existing).toEqual(true)
			const nonExisting = await schemaInfo.hasColumn("posts", "title_body")
			expect(nonExisting).toEqual(false)
		})
	})

	describe("getTablesNames", () => {
		it("should check if column exists", async () => {
			const names = await schemaInfo.getTableNames()
			for (const col of systemCollections) {
				expect(names).includes(col.tableName)
			}

			for (const col of allMockCollectionDefs) {
				expect(names).includes(col.tableName)
			}
		})

		it.skip("should get only columns in our schema", () => {
			// can't test for now since maybe other test is changing db
		})
	})

	describe("getColumns", () => {
		it("should get single column", async () => {
			const cols = await schemaInfo.getColumns("posts", "id")
			expect(cols[0]).toEqual(mockColumns.posts.id)
		})

		it("should get columns for single table", async () => {
			const cols = await schemaInfo.getColumns("posts")
			const data = objectify(cols, (c) => c.columnName)
			expect(data).toEqual(mockColumns.posts)
		})

		it("should get all columns", async () => {
			const cols = await schemaInfo.getColumns()
			expect(cols.length > 100).toEqual(true)
		})
	})

	describe("getColumn", () => {
		it("should use getColumns method", async () => {
			schemaInfo.getColumns = vi.fn(async () => [mockColumns.posts.id])
			const col = await schemaInfo.getColumn("posts", "id")
			expect(schemaInfo.getColumns).toBeCalledWith("posts", "id", undefined)
			expect(col).toEqual(mockColumns.posts.id)
		})
	})

	describe("getPrimaryKey", () => {
		it("should get primary key column", async () => {
			schemaInfo.getColumn = vi.fn(async () => mockColumns.posts.id)
			const pk = await schemaInfo.getPrimaryKey("posts")
			expect(schemaInfo.getColumn).toBeCalledWith("posts", "id", undefined)
			expect(pk).toEqual(mockColumns.posts.id)
		})
	})

	describe("getForeignKeys", () => {
		it("should get foreign keys", async () => {
			const fks = await schemaInfo.getForeignKeys("posts_tags")
			const fkObjects = objectify(fks, (fk) => fk.fkColumn)
			expect(fkObjects).toEqual({
				post_id: mockForeignKeys.posts_tags_post_id_fkey,
				tag_id: mockForeignKeys.posts_tags_tag_id_fkey,
			})
		})
	})

	describe("getForeignKey", () => {
		it("should use getForeignKeys method", async () => {
			schemaInfo.getForeignKeys = vi.fn(async () => [mockForeignKeys.comments_post_id_fkey])
			const fk = await schemaInfo.getForeignKey("comments", "post_id")
			expect(schemaInfo.getForeignKeys).toBeCalledWith("comments", "post_id", undefined)
			expect(fk).toEqual(mockForeignKeys.comments_post_id_fkey)
		})
	})

	describe("getUniqueKeys", () => {
		it("should get unique keys in table", async () => {
			const uniques = await schemaInfo.getUniqueKeys("tags")
			expect(uniques).toEqual<UniqueKey[]>([
				{
					columnNames: ["name"],
					keyName: expect.any(String),
					schemaName: "public",
					tableName: "tags",
				},
			])
		})

		it("should get only composite keys", async () => {
			const tagsUnique = await schemaInfo.getUniqueKeys("tags", { type: "composite" })
			expect(tagsUnique).toHaveLength(0)

			const postsTags = await schemaInfo.getUniqueKeys("posts_tags", { type: "composite" })
			expect(postsTags).toHaveLength(1)
		})

		it("should get only single keys", async () => {
			const postsTags = await schemaInfo.getUniqueKeys("posts_tags", { type: "single" })
			expect(postsTags).toHaveLength(0)

			const tagsUnique = await schemaInfo.getUniqueKeys("tags", { type: "single" })
			expect(tagsUnique).toHaveLength(1)
		})

		it("should get all keys", async () => {
			const postsTags = await schemaInfo.getUniqueKeys()
			// don't know exactly how much there is
			expect(postsTags.length > 10).toEqual(true)
		})
	})

	describe("getSingleUniqueKeys", () => {
		it("should get single unique keys in table", async () => {
			const fakeUniqueKey: UniqueKey = {
				columnNames: ["name"],
				keyName: "key_name",
				schemaName: "public",
				tableName: "tags",
			}
			schemaInfo.getUniqueKeys = vi.fn(async () => [fakeUniqueKey])
			const uniques = await schemaInfo.getSingleUniqueKeys("tags")
			expect(schemaInfo.getUniqueKeys).toBeCalledWith("tags", { type: "single" })
			expect(uniques).toEqual<SingleUniqueKey[]>([
				{
					keyName: "key_name",
					schemaName: "public",
					tableName: "tags",
					columnName: "name",
				},
			])
		})
	})

	describe("getCompositeUniqueKeys", () => {
		it("should get composite unique keys in table", async () => {
			const fakeUniqueKey: UniqueKey = {
				columnNames: ["tag_id", "post_id"],
				keyName: "key_name",
				schemaName: "public",
				tableName: "posts_tags",
			}
			schemaInfo.getUniqueKeys = vi.fn(async () => [fakeUniqueKey])
			const uniques = await schemaInfo.getCompositeUniqueKeys("posts")
			expect(schemaInfo.getUniqueKeys).toBeCalledWith("posts", { type: "composite" })
			expect(uniques).toEqual([fakeUniqueKey])
		})
	})
})
