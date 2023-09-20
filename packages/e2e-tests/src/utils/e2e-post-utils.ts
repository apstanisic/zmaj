import { faker } from "@faker-js/faker"
import { TPost, TPostModel } from "@zmaj-js/test-utils"
import { GetCreateFields } from "zmaj"
import { getOrm } from "../setup/e2e-orm.js"
import { getUniqueId } from "../setup/e2e-unique-id.js"

async function deleteByTitle(title: string): Promise<void> {
	const orm = await getOrm()
	await orm.repoManager.getRepo(TPostModel).deleteWhere({ where: { title } })
}

async function create(
	title: string,
	rest: Partial<GetCreateFields<TPostModel, true>> = {},
): Promise<TPost> {
	const orm = await getOrm()
	const res = await orm.repoManager.getRepo(TPostModel).createOne({
		overrideCanCreate: true,
		data: {
			likes: 5,
			body: faker.lorem.paragraphs(2),
			...rest,
			title,
		},
	})
	return res
}

function getRandTitle(): string {
	return `${faker.company.catchPhrase()} ${getUniqueId()}`
}

export const postUtils = {
	create,
	deleteByTitle,
	getRandTitle,
}
