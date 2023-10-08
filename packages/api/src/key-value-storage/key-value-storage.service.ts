import { Injectable } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"
import { CreateKeyValueSchema, KeyValue, KeyValueModel, zodCreate } from "@zmaj-js/common"
import { GetCreateFields, Orm, OrmRepository, Transaction } from "@zmaj-js/orm"

type CreateKeyValueParams = GetCreateFields<KeyValueModel, false>

@Injectable()
export class KeyValueStorageService {
	private repo: OrmRepository<KeyValueModel>
	constructor(private readonly orm: Orm) {
		this.repo = this.orm.getRepo(KeyValueModel)
	}

	/**
	 * Don't use repo, use custom methods because that method parsed result
	 */
	async findByKey(
		key: string,
		namespace: string | null = null,
		options: { trx?: Transaction } = {},
	): Promise<KeyValue | undefined> {
		return this.repo.findOne({
			where: {
				key,
				namespace,
				// only values that have not expired
				$or: [{ expiresAt: { $lte: new Date() } }, { expiresAt: null }],
			},
			trx: options.trx,
		})
	}

	/**
	 * Store new key value pair in database
	 * @param data
	 * @param em It accepts EntityManager in case it's in transaction
	 */
	async create(data: CreateKeyValueParams, trx?: Transaction): Promise<KeyValue> {
		const saved = await this.repo.createOne({
			data: zodCreate(CreateKeyValueSchema, data),
			trx,
		})
		return saved
	}

	/**
	 * When you are using store to set a flag, it's best to use this, cause it will not
	 * throw an error if it already exist, but will update row
	 */
	async upsert(data: CreateKeyValueParams, trx?: Transaction): Promise<KeyValue> {
		const exist = await this.findByKey(data.key, data.namespace)

		if (exist) {
			return this.repo.updateById({
				id: exist.id,
				changes: { value: data.value },
				trx,
			})
		} else {
			return this.create(data, trx)
		}
	}

	/**
	 * Key and namespace are composite unique
	 */
	async delete(
		key: string,
		namespace: string | null = null,
		options: { trx?: Transaction } = {},
	): Promise<KeyValue | undefined> {
		const deleted = await this.repo.deleteWhere({
			where: { key, namespace: namespace },
			trx: options.trx,
		})
		return deleted[0]
	}

	/**
	 * This will run cron job every 5 minutes that will delete expired values
	 */
	@Cron(CronExpression.EVERY_5_MINUTES)
	async __deleteExpiredValues(): Promise<void> {
		await this.repo.deleteWhere({
			where: { expiresAt: { $lte: new Date() } },
		})
	}
}
