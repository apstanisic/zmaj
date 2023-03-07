import { randColor, randParagraph, randPastDate, randPost } from "@ngneat/falso"
import { times } from "@zmaj-js/common"
import { draw, random, unique } from "radash"
import { v4 } from "uuid"
import { chance } from "../chance.js"
import { UserStub } from "../index.js"
import { RoleStub } from "../stubs/role.stub.js"

type Post = {
	id: string
	title: string
	body: string
	createdAt: Date
	likes: number
	coverFileId: string | null
	writerId: string
	status: string
}

type Comment = {
	id: string
	body: string
	postId: string
	userId: string
}

type Tag = {
	id: string
	name: string
}

type PostTag = {
	id?: number
	postId: string
	tagId: string
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function createBlogDemo() {
	const roles = [RoleStub({ name: "Editor" }), RoleStub({ name: "Writer" })]

	const users = times(15, (i) => UserStub({ roleId: roles[chance(0.8, 0, 1)]!.id }))

	const posts = times(60, (i): Post => {
		const p = randPost()
		const writerId = draw(users.filter((u) => u.roleId === roles[0]!.id))!.id
		return {
			id: v4(),
			title: p.title,
			body: p.body,
			writerId,
			createdAt: randPastDate(),
			likes: random(0, 15),
			coverFileId: null,
			status: draw(["draft", "pending", "published"])!,
		}
	})
	const comments = posts.flatMap((p) =>
		times(
			5,
			(i): Comment => ({ id: v4(), body: randParagraph(), postId: p.id, userId: draw(users)!.id }),
		),
	)

	const tags = unique(
		times(12, (i): Tag => ({ id: v4(), name: randColor() })),
		(t) => t.name,
	)

	const postsTags = unique(
		times(50, (i): PostTag => ({ postId: draw(posts)!.id, tagId: draw(tags)!.id })),
		(pt) => pt.tagId + pt.postId,
	)

	return { posts, users, roles, comments, tags, postsTags }
}
