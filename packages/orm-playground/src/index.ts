import { Orm } from "@zmaj-js/orm-engine"
import { sqOrmProvider } from "@zmaj-js/orm-sq"
import { inspect } from "node:util"
import { CommentModel, PostInfoModel, PostModel, PostTagModel, TagModel } from "./example-models"
inspect.defaultOptions.depth = null
const falsy: boolean = false

async function run(): Promise<void> {
	const orm = new Orm({
		models: [PostModel, TagModel, CommentModel, PostTagModel, PostInfoModel],
		config: {
			database: "dev_database",
			host: "localhost",
			password: "db_password",
			username: "db_user",
			port: 5432,
		},
		provider: sqOrmProvider,
	})

	await orm.init()
	const postRepo = orm.repoManager.getRepo(PostModel)
	const postInfoRepo = orm.repoManager.getRepo(PostInfoModel)
	const commentsRepo = orm.repoManager.getRepo(CommentModel)
	const post1 = await postRepo.findOneOrThrow({
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
	// @ts-expect-error Should be undefined, cause we can't be certain that it exist
	post1.info.additionalInfo
	// const post1 = result[0]!
	if (falsy) {
		post1.title
		// @ts-expect-error
		post1.body.at
	}
	// console.log({ user: result })

	const comment = await commentsRepo.findOneOrThrow({
		fields: {
			post: { title: true, tags: { id: true, name: true, posts: { likes: true } } },
			id: true,
			postId: true,
		},
	})
	console.log({ res2: comment })
	comment.post.tags[0]?.posts[0]?.likes
	if (falsy) {
		comment.post.title.at
		// @ts-expect-error
		comment.post.body.at
	}

	const res = await postInfoRepo.findOneOrThrow({
		fields: {
			post: true,
			id: true,
		},
	})
	if (falsy) {
		res.post.body
	}

	await orm.destroy()
}

run()
