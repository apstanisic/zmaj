import { Webhook, WebhookCreateDto, WebhookModel } from "@zmaj-js/common"
import { getOrm } from "../../setup/e2e-orm.js"

const orm = await getOrm()
const repo = orm.repoManager.getRepo(WebhookModel)
export const webhookUtils = {
	repo,
	deleteByName: async (name: string): Promise<void> => {
		await repo.deleteWhere({ where: { name } })
	},
	create: (dto: WebhookCreateDto): Promise<Webhook> => repo.createOne({ data: dto }),
	findByName: (name: string): Promise<Webhook | undefined> => repo.findOne({ where: { name } }),
}
