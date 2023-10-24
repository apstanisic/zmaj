import { GlobalConfig } from "@api/app/global-app.config"
import { mixedColDef } from "@api/collection-to-model-config"
import { throw500 } from "@api/common/throw-http"
import { BootstrapOrm } from "@api/database/BootstrapOrm"
import { EncryptionService } from "@api/encryption/encryption.service"
import { MigrationsConfig } from "@api/migrations/migrations.config"
import { MigrationsService } from "@api/migrations/migrations.service"
import { MigrationsUmzugStorage } from "@api/migrations/migrations.umzug-storage"
import { getRequiredColumns } from "@api/migrations/migrations.utils"
import { Injectable } from "@nestjs/common"
import { rand } from "@ngneat/falso"
import {
	ADMIN_ROLE_ID,
	FileModel,
	RoleModel,
	User,
	UserModel,
	systemCollections,
	systemModels,
	times,
} from "@zmaj-js/common"
import { SchemaInfoService } from "@zmaj-js/orm"
import { SequelizeService } from "@zmaj-js/orm-sq"
import {
	TCommentModel,
	TCommentStub,
	TPostInfoModel,
	TPostInfoStub,
	TPostModel,
	TPostStub,
	TPostTagModel,
	TPostTagStub,
	TTagModel,
	TTagStub,
	allMockCollectionDefs,
	createBlogDemo,
	eCommerceDemo,
	mockCompositeUniqueKeyId,
} from "@zmaj-js/test-utils"
import { draw, omit, pick, random, shuffle, unique } from "radash"
import { DataTypes, QueryInterface } from "sequelize"
import { configureBlogInfra } from "./blog-demo"
import mockData from "./const-mocks.json"
import { initECommerce, storeExampleModels } from "./ecommerce-demo"

type Trx = any // Transaction | SqTrx

@Injectable()
export class BuildTestDbService {
	qi: QueryInterface
	schemaInfo: SchemaInfoService
	constructor(
		private sq: SequelizeService,
		private orm: BootstrapOrm,
	) {
		this.qi = this.sq.orm.getQueryInterface()
		this.schemaInfo = orm.schemaInfo
	}

	async initSqWithMocks(): Promise<void> {
		this.sq.generateModels(
			mixedColDef([...systemModels, ...allMockCollectionDefs, ...storeExampleModels]),
		)
		await this.sq.init()
	}

	private exampleProjectTables = [
		"posts",
		"comments",
		"tags",
		"posts_tags",
		"posts_info",
	] as const

	async seedRandomData(): Promise<void> {
		// posts
		const posts = await this.orm.getRepo(TPostModel).createMany({
			overrideCanCreate: true,
			data: times(60, () => omitCreatedAt(TPostStub())),
		})
		const postIds = posts.map((p) => p.id)

		// tags
		const tags = await this.orm.getRepo(TTagModel).createMany({
			overrideCanCreate: true,
			data: unique(
				times(12, () => TTagStub()),
				(t) => t.name,
			),
		})
		const tagIds = tags.map((p) => p.id)

		// comments
		const comments = await this.orm.getRepo(TCommentModel).createMany({
			overrideCanCreate: true,
			data: times(12, () => TCommentStub({ postId: rand(postIds) })),
		})

		// posts_info
		const postIdsForPostInfo = shuffle(postIds)
		const postsInfo = await this.orm.getRepo(TPostInfoModel).createMany({
			overrideCanCreate: true,
			data: times(25, () => TPostInfoStub({ postId: postIdsForPostInfo.shift() })),
		})

		// posts_tags
		// for every post, create between 0 and 8 (inclusive) tag connections
		const postsTags = await this.orm.getRepo(TPostTagModel).createMany({
			overrideCanCreate: true,
			data: postIds
				.map((postId) => {
					const tIds = shuffle(tagIds)
					return times(random(1, 9), (i) =>
						TPostTagStub({ id: null, postId, tagId: tIds.shift() }),
					)
				})
				.flatMap((v) => v),
		})
	}

	async seedConstData(): Promise<void> {
		await this.orm.getRepo(TPostModel).createMany({ data: mockData.posts as any })
		await this.orm
			.getRepo(TTagModel)
			.createMany({ data: mockData.tags, overrideCanCreate: true })
		await this.orm
			.getRepo(TCommentModel)
			.createMany({ data: mockData.comments, overrideCanCreate: true })
		await this.orm
			.getRepo(TPostInfoModel)
			.createMany({ data: mockData.postInfo, overrideCanCreate: true })
		await this.orm.getRepo(TPostTagModel).createMany({ data: mockData.postsTags })
	}

	async dropSystemTables(trx?: Trx): Promise<void> {
		for (const col of systemCollections) {
			await this.qi.dropTable(col.tableName, { transaction: trx, cascade: true })
		}
	}

	async dropPostsExampleTables(trx?: Trx): Promise<void> {
		for (const tableName of this.exampleProjectTables) {
			await this.qi.dropTable(tableName, { transaction: trx, cascade: true })
		}
	}

	async dropAllNonSystemTables(trx?: Trx): Promise<void> {
		const tables = await this.schemaInfo.getTableNames({ trx })
		for (const table of tables.filter((t) => !t.startsWith("zmaj"))) {
			await this.qi.dropTable(table, { transaction: trx, cascade: true })
		}
	}

	async dropAllTables(trx?: Trx): Promise<void> {
		await this.dropAllNonSystemTables(trx)
		await this.dropSystemTables(trx)
	}

	async emptyTables(trx?: Trx): Promise<void> {
		await this.emptyPostsExampleTables(trx)
		await this.emptySystemTables(trx)
	}

	async emptySystemTables(trx?: Trx): Promise<void> {
		for (const { tableName } of systemCollections) {
			await this.sq.rawQuery(`DELETE FROM $1;`, { trx, params: [tableName] })
		}
	}

	async emptyPostsExampleTables(trx?: Trx): Promise<void> {
		for (const tableName of this.exampleProjectTables) {
			await this.sq.rawQuery(`DELETE FROM $1;`, { trx, params: [tableName] })
		}
	}

	async createTables(trx?: Trx): Promise<void> {
		await this.createSystemTables(trx)
		await this.createPostsExampleTables(trx)
	}

	async createSystemTables(trx?: Trx): Promise<void> {
		const mg = new MigrationsService(
			new MigrationsUmzugStorage(this.orm),
			this.schemaInfo,
			this.orm,
			new MigrationsConfig({}),
			this.sq,
		)
		await mg.runSystemMigrations()

		// const execute = async (query: string): Promise<void> => {
		// 	await this.sq.rawQuery(query, { trx })
		// }
		// for (const migration of systemMigrations) {
		// 	if (isString(migration.up)) {
		// 		await execute(migration.up)
		// 	} else {
		// 		await migration.up(execute, {
		// 			databaseType: "postgres",
		// 			qi: this.qi,
		// 			repoManager: this.repoManager,
		// 			trx,
		// 		})
		// 	}
		// }
	}

	async createStoreSchema(trx?: Trx): Promise<void> {
		await this.orm.transaction({
			trx,
			fn: async (trx) => {
				await initECommerce(this.sq, trx)
			},
		})
	}

	async createPostsExampleTables(trx?: Trx): Promise<void> {
		await this.qi.createTable(
			"posts",
			{
				...getRequiredColumns(),
				title: { type: DataTypes.STRING, allowNull: false },
				body: { type: DataTypes.TEXT, allowNull: false },
				likes: { type: DataTypes.INTEGER, allowNull: false },
			},
			{ transaction: trx },
		)

		await this.qi.createTable(
			"comments",
			{
				...pick(getRequiredColumns(), ["id"]),
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

		await this.qi.createTable(
			"tags",
			{
				...pick(getRequiredColumns(), ["id"]),
				name: { type: DataTypes.STRING, allowNull: false, unique: true },
			},
			{ transaction: trx },
		)

		await this.qi.createTable(
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
				uniqueKeys: {
					[mockCompositeUniqueKeyId.posts_tags]: { fields: ["tag_id", "post_id"] },
				},
				transaction: trx,
			},
		)

		await this.qi.createTable(
			"posts_info",
			{
				...pick(getRequiredColumns(), ["id"]),
				post_id: {
					type: DataTypes.UUID,
					unique: true,
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
		await configureBlogInfra(this.orm, trx)
	}

	async createMockAdmin(): Promise<User> {
		const password = await new EncryptionService({
			secretKey: process.env["SECRET_KEY"] ?? throw500(423789423),
		} as GlobalConfig).hash("password")

		const repo = this.orm.getRepo<UserModel>(UserModel)
		return repo.createOne({
			data: {
				email: "admin@example.com",
				password,
				roleId: ADMIN_ROLE_ID,
				status: "active",
				confirmedEmail: true,
			},
		})
	}

	async seedECommerceDemo(): Promise<void> {
		const roleRepo = this.orm.getRepo(RoleModel)
		const userRepo = this.orm.getRepo(UserModel)
		const tagRepo = this.orm.getRepo("tags")
		const productRepo = this.orm.getRepo("products")
		const reviewRepo = this.orm.getRepo("reviews")
		const orderRepo = this.orm.getRepo("orders")
		const orderProductRepo = this.orm.getRepo("orderProducts")
		const categoryRepo = this.orm.getRepo("categories")
		const productTagRepo = this.orm.getRepo("productsTags")

		await this.orm.transaction({
			fn: async (trx) => {
				await orderProductRepo.deleteWhere({ where: {} })
				await productTagRepo.deleteWhere({ where: {} })
				await orderRepo.deleteWhere({ where: {} })
				await reviewRepo.deleteWhere({ where: {} })
				await productRepo.deleteWhere({ where: {} })
				await tagRepo.deleteWhere({ where: {} })
				await categoryRepo.deleteWhere({ where: {} })
				await userRepo.deleteWhere({ where: { email: { $ne: "admin@example.com" } } })
				await roleRepo.deleteWhere({ where: { name: { $eq: "Shopper" } } })

				const images = await this.orm
					.getRepo(FileModel)
					.findWhere({ where: { mimeType: { $like: "image%" } } })

				await roleRepo.createMany({
					data: eCommerceDemo.roles.map(omitCreatedAt),
					trx,
				})
				await userRepo.createMany({ data: eCommerceDemo.users.map(omitCreatedAt), trx })
				await categoryRepo.createMany({ data: eCommerceDemo.categories, trx })
				await tagRepo.createMany({ data: eCommerceDemo.tags, trx })
				await productRepo.createMany({
					data: eCommerceDemo.products.map((p) => ({ ...p, fileId: draw(images)?.id })),
					trx,
				})
				await reviewRepo.createMany({ data: eCommerceDemo.reviews, trx })

				await orderRepo.createMany({ data: eCommerceDemo.orders, trx })
				await orderProductRepo.createMany({ data: eCommerceDemo.orderProducts, trx })
				await productTagRepo.createMany({ data: eCommerceDemo.productTags, trx })
			},
		})
	}

	async buildBlogDemo(): Promise<void> {
		const roleRepo = this.orm.getRepo(RoleModel)
		const userRepo = this.orm.getRepo(UserModel)
		const tagRepo = this.orm.getRepo("tags")
		const postsRepo = this.orm.getRepo("posts")
		const commentsRepo = this.orm.getRepo("comments")
		const postsTagsRepo = this.orm.getRepo("postsTags")

		const data = createBlogDemo()

		await this.orm.transaction({
			fn: async (trx) => {
				await postsTagsRepo.deleteWhere({ where: {} })
				await tagRepo.deleteWhere({ where: {} })
				await commentsRepo.deleteWhere({ where: {} })
				await postsRepo.deleteWhere({ where: {} })
				await userRepo.deleteWhere({ where: { email: { $ne: "admin@example.com" } } })
				await roleRepo.deleteWhere({ where: { name: { $nin: ["Admin", "Public"] } } })

				const images = await this.orm
					.getRepo(FileModel)
					.findWhere({ where: { mimeType: { $like: "image%" } } })

				await roleRepo.createMany({ data: data.roles.map(omitCreatedAt), trx })
				await userRepo.createMany({ data: data.users.map(omitCreatedAt), trx })
				await tagRepo.createMany({ data: data.tags, trx })
				await postsRepo.createMany({
					data: data.posts.map((p) => ({ ...p, coverFileId: draw(images)?.["id"] })),
					trx,
				})

				await commentsRepo.createMany({ data: data.comments, trx })
				await postsTagsRepo.createMany({ data: data.postsTags, trx })
			},
		})
	}
}

const omitCreatedAt = <T extends { createdAt: any }>(data: T): Omit<T, "createdAt"> => {
	return omit(data, ["createdAt"])
}
