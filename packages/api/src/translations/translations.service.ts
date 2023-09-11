import { AuthorizationService } from "@api/authorization/authorization.service"
import { throw400, throw500 } from "@api/common/throw-http"
import { emsg } from "@api/errors"
import { InfraStateService } from "@api/infra/infra-state/infra-state.service"
import { ForbiddenException, Injectable } from "@nestjs/common"
import {
	AuthUser,
	Struct,
	Translation,
	TranslationCreateDto,
	TranslationModel,
	TranslationSchema,
	TranslationUpdateDto,
	UUID,
	zodCreate,
} from "@zmaj-js/common"
import { IdType, OrmRepository, RepoManager } from "@zmaj-js/orm"

type CommonParams = {
	language: string
	collectionName: string
	user?: AuthUser
}

type ManyItemsParams = CommonParams & {
	itemIds: IdType[]
}

type OneItemParams = CommonParams & {
	itemId: IdType
}

/**
 * This service is used for manipulating translations, it should not be used for getting
 * translations for given resource, it's integrated in CRUD services.
 */
@Injectable()
export class TranslationsService {
	repo: OrmRepository<TranslationModel>
	constructor(
		private readonly repoManager: RepoManager,
		private readonly infraState: InfraStateService,
		private readonly authz: AuthorizationService,
	) {
		this.repo = this.repoManager.getRepo(TranslationModel)
	}

	/**
	 * Create translation
	 */
	async createTranslation(data: TranslationCreateDto, user?: AuthUser): Promise<Translation> {
		const collection =
			this.infraState.getCollection(data.collectionId) ?? throw400(94723, emsg.notFound())

		const collectionRepo = this.repoManager.getRepo(collection.collectionName)

		const item = await collectionRepo.findById({ id: data.itemId })

		// check if user can create normal record, not translation, since translation is extension
		// of normal record
		const allowed = this.authz.canModifyRecord({
			action: "update",
			record: item,
			resource: collection,
			user,
			changes: data,
		})

		if (!allowed) throw new ForbiddenException("3972342")

		const saved = await this.repo.createOne({
			data: zodCreate(TranslationSchema.omit({ createdAt: true }), data),
		})
		return saved
	}

	async updateTranslation(
		id: UUID,
		data: TranslationUpdateDto,
		user?: AuthUser,
	): Promise<Translation> {
		const translation = await this.repo.findById({
			id,
			fields: { collectionId: true, id: true, itemId: true },
		})
		const collection =
			Object.values(this.infraState.collections).find((c) => c.id === translation.collectionId) ??
			throw500(89342)

		const collectionRepo = this.repoManager.getRepo(collection.collectionName)

		const originalItem = await collectionRepo.findById({ id: translation.itemId })

		const allowed = this.authz.canModifyRecord({
			action: "update",
			record: originalItem,
			resource: collection,
			user,
			changes: data,
		})
		if (!allowed) throw new ForbiddenException("3972342")

		const updated = await this.repo.updateById({
			id,
			changes: data,
		})

		const allowedTranslation = this.authz.pickAllowedData({
			resource: collection,
			record: updated.translations as Struct,
			user,
		})
		return {
			...updated,
			translations: allowedTranslation as any,
		}
	}

	/**
   * Delete many translations for one language and one column
  //  */
	// async deleteMany(params: ManyItemsParams): Promise<void> {
	//   let toDelete = await this.getTranslations(params);
	//   const { collectionName, user } = params;
	//   toDelete = toDelete.filter((item) =>
	//     this.acl.isAllowed({ user, action: 'delete', item, table: collectionName }),
	//   );
	//   await this.repo.remove(toDelete);
	// }
	/**
	 * Get all translations for given collection, language and item ids.
	 * This does not check permissions
	 */
	// private async getTranslations({
	//   collectionName,
	//   itemIds,
	//   language,
	// }: Omit<ManyItemsParams, 'user'>): Promise<Translation[]> {
	//   const collectionId = this.getIdFromTableName(collectionName);
	//   const translations = await this.repo.find({
	//     where: {
	//       language,
	//       collectionId,
	//       itemId: In(itemIds.map((id) => `${id}`)),
	//     },
	//   });
	//   return translations;
	// }
	/**
	 * Delete translations where item is deleted
	 */
	// @OnEvent('zmaj.collections.*.delete.after')
	// async onItemsDelete(event: CrudAfterEvent): Promise<void> {
	//   const { collection, ids, em } = event
	//   if (collection.startsWith('zmaj')) return
	//   const collectionId = this.getIdFromTableName(collection)
	//   await em
	//     .getRepository(TranslationEntity)
	//     .delete({ collectionId, itemId: In(ids.map((id) => `${id}`)) })
	// }
	// /**
	//  * We are hooking into read event, and check if user provided language in url query
	//  * Fetch translations for every id,
	//  * For every item that have translation
	//  * we will replace current value with translation value, if both are not null
	//  *
	//  * @warning Translations are only top level deep supported Joins will not be translated
	//  */
	// @OnEvent('zmaj.collections.*.read.after')
	// async onItemsRead(event: CrudReadAfterEvent): Promise<void> {
	//   const { collection, ids, after, meta } = event
	//   const language = meta.query.language
	//   // TODO Implement this flag
	//   const removeNonTranslationValues = false
	//   if (isNil(language)) return
	//   const { pkColumn } = this.crudBase.checkTable({ table: collection })
	//   const translations = await this.repo.find({
	//     where: {
	//       language,
	//       // Value is stored as string
	//       itemId: In(ids.map((id) => id.toString())),
	//       collectionId: this.getIdFromTableName(collection),
	//     },
	//   })
	//   for (const item of after) {
	//     const tr = translations.find((tr) => tr.itemId === item[pkColumn.propertyName])
	//     if (!tr) continue
	//     for (const itemKey of keys(item)) {
	//       // This will remove original value regardless if it has or does not have translations
	//       // Only exception is PK
	//       if (removeNonTranslationValues && pkColumn.propertyName !== itemKey) {
	//         item[itemKey] = tr.translations[itemKey] ?? undefined
	//       }
	//       // Replace fields with translations (unless it's pk)
	//       else if (tr.translations[itemKey] !== undefined && itemKey !== pkColumn.propertyName) {
	//         item[itemKey] = tr.translations[itemKey]
	//       }
	//     }
	//   }
	// }
}
