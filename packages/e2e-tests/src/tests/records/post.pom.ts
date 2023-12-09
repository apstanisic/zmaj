import { faker } from "@faker-js/faker"
import { Locator } from "@playwright/test"
import { times } from "@zmaj-js/common"
import {
	TCommentModel,
	TPost,
	TPostModel,
	TPostTagModel,
	TTag,
	TTagModel,
} from "@zmaj-js/test-utils"
import { GetCreateFields, Orm, OrmRepository, RepoFilterWhere } from "zmaj"
import { getUniqueWord } from "../../setup/e2e-unique-id.js"
import { GlobalPageFx } from "../../setup/global.fx.js"

export class PostPageFx extends GlobalPageFx {
	get sidebarPostsLink(): Locator {
		return this.sidebarLink("Posts")
	}

	get titleInput(): Locator {
		return this.page.getByLabel("Title")
	}
	get bodyInput(): Locator {
		return this.page.getByLabel("Body")
	}
	get likesInput(): Locator {
		return this.selector.numberInput("Likes")
	}

	async isOnPostsList(): Promise<void> {
		await this.isOnListPageUrl("posts")
	}
}

export class PostUtilsFx {
	constructor(private orm: Orm) {}
	get repo(): OrmRepository<TPostModel> {
		return this.orm.repoManager.getRepo(TPostModel)
	}

	get tagsRepo(): OrmRepository<TTagModel> {
		return this.orm.repoManager.getRepo(TTagModel)
	}

	async removeWhere(where: RepoFilterWhere<TPostModel>): Promise<void> {
		await this.repo.deleteWhere({ where })
	}

	async removeTags(tags: TTag[]): Promise<void> {
		await this.tagsRepo.deleteWhere({ where: { id: { $in: tags.map((t) => t.id) } } })
	}

	async findWhere(where: RepoFilterWhere<TPostModel>): Promise<TPost | undefined> {
		return this.repo.findOne({ where })
	}

	create(data: Partial<GetCreateFields<TPostModel, false>> = {}): Promise<TPost> {
		return this.repo.createOne({
			data: {
				body: faker.lorem.paragraphs(2),
				likes: faker.number.int({ max: 300 }),
				title: faker.company.name(),
				...data,
			},
		})
	}

	async crudWithRelationsSetup(prefix: string, post?: TPost) {
		// create random post to assign comments that do not belong to main post
		const randomPost = await this.create()

		const tags = await this.orm.repoManager
			.getRepo(TTagModel)
			.createMany({ data: times(5, (i) => ({ name: `${prefix}tag${i}${getUniqueWord()}` })) })

		if (post) {
			// If post does not exist, we cannot add tags
			await this.orm.repoManager.getRepo(TPostTagModel).createMany({
				data: tags.slice(0, 3).map((tag) => ({ tagId: tag.id, postId: post.id })),
			})
		}

		const comments = await this.orm.repoManager.getRepo(TCommentModel).createMany({
			data: times(5, (i) => ({
				body: `${prefix}cm${i}${faker.lorem.paragraph()}`,
				// if post does not exist, assign all to random post
				postId: i < 3 ? post?.id ?? randomPost.id : randomPost.id,
			})),
		})

		return {
			comments,
			tags,
			randomPost,
		}
	}
}
