import { DatabaseConfig, SequelizeService } from "@zmaj-js/orm"
import { inspect } from "node:util"
import { CommentModel, PostInfoModel, PostModel, PostTagModel, TagModel } from "./example-models"
inspect.defaultOptions.depth = null
const falsy: boolean = false

const service = new SequelizeService(
	new DatabaseConfig({
		database: "dev_database",
		host: "localhost",
		password: "db_password",
		username: "db_user",
		port: 5432,
	}),
)

async function run() {
	console.log("here")

	await service.init([PostModel, TagModel, CommentModel, PostTagModel, PostInfoModel])
	const postRepo = service.repoManager.getRepo(PostModel)
	const commentsRepo = service.repoManager.getRepo(CommentModel)
	const result = await postRepo.findWhere({
		limit: 2,
		where: {
			title: { $ne: "Hello World!" },
			body: { $nin: ["John", "Smith"] },
		},
		fields: {
			likes: true,
			comments: { postId: true, body: true },
			tags: { name: true },
			title: true,
			info: { additionalInfo: true },
		},
	})
	const post1 = result[0]!
	if (falsy) {
		post1.title.at
		// @ts-expect-error
		post1.body.at
	}
	console.log({ user: result })

	const comment = await commentsRepo.findOneOrThrow({
		fields: {
			post: { title: true },
			id: true,
			postId: true,
		},
	})
	console.log({ res2: comment })
	if (falsy) {
		comment.post.title.at
		// @ts-expect-error
		comment.post.body.at
	}

	await service.onModuleDestroy()
}

run()
