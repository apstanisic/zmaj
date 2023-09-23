import { faker } from "@faker-js/faker"
import { TPost, TPostModel, TTag, TTagModel } from "@zmaj-js/test-utils"
import { GetCreateFields, Orm, OrmRepository, RepoFilterWhere } from "zmaj"
import { ZmajCrudPage } from "../../setup/ZmajCrudPage.js"

export class PostPageFx extends ZmajCrudPage {
	override title: string = "posts"
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
}
