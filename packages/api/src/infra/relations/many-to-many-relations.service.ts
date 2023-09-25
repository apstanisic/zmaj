import { throw400 } from "@api/common/throw-http"
import { emsg } from "@api/errors"
import { InfraStateService } from "@api/infra/infra-state/infra-state.service"
import { Injectable } from "@nestjs/common"
import {
	JunctionRelation,
	RelationCreateDto,
	RelationDef,
	RelationMetadata,
	RelationMetadataModel,
} from "@zmaj-js/common"
import { AlterSchemaService, OrmRepository, RepoManager, SchemaInfoService } from "@zmaj-js/orm"
import { alphabetical, isEqual } from "radash"
import { CreateManyToManyRelationsService } from "./create-many-to-many-relations.service"

@Injectable()
export class ManyToManyRelationsService {
	private repo: OrmRepository<RelationMetadataModel>
	constructor(
		private createMtmService: CreateManyToManyRelationsService, //
		private infraState: InfraStateService,
		private alterSchema: AlterSchemaService,
		private repoManager: RepoManager,
		private schemaInfo: SchemaInfoService,
	) {
		this.repo = this.repoManager.getRepo(RelationMetadataModel)
	}

	async createRelation(dto: RelationCreateDto): Promise<RelationMetadata> {
		return this.createMtmService.createRelation(dto)
	}

	async deleteRelation(relation: RelationDef): Promise<void> {
		await this.repoManager.transaction({
			fn: async (trx) => {
				if (!relation.junction) throw400(935423, emsg.notMtmRelation)

				await this.alterSchema.dropUniqueKey({
					tableName: relation.junction.tableName,
					columnNames: [
						relation.junction.thisSide?.columnName,
						relation.junction.otherSide?.columnName,
					],
					indexName: relation.junction.uniqueKey,
					trx,
				})

				await this.alterSchema.dropForeignKey({
					fkColumn: relation.junction.thisSide?.columnName,
					fkTable: relation.junction.tableName,
					indexName: relation.relation.fkName,
					trx,
				})

				await this.alterSchema.dropForeignKey({
					fkColumn: relation.junction.otherSide?.columnName,
					fkTable: relation.junction.tableName,
					indexName: relation.relation.mtmFkName,
					trx,
				})

				// delete all relations that belong to this 2 fks
				await this.repo.deleteWhere({
					trx,
					where: {
						$or: [{ fkName: relation.relation.fkName }, { fkName: relation.relation.mtmFkName! }],
					},
				})
			},
		})
	}

	/**
	 * Convert 2 "many-to-one" relations to one "many-to-many" relation
	 * We pass relation ids from junction table
	 *
	 * @param relationId1 Relation ID from left table
	 * @param relationId2 Relation ID from right table
	 */
	async joinManyToMany(junctionCollection: string): Promise<void> {
		await this.infraState.initializeState()

		// Expand relations, since we need to check if other side of both relations is same table
		// That table will become junction table
		const [rel1, rel2, ...otherRel] = this.infraState.relations.filter(
			(r) => r.type === "many-to-one" && r.collectionName === junctionCollection,
			// (r) => isIn(r.id, [relationId1, relationId2]) && r.type === "many-to-one",
		)
		if (otherRel.length > 0) throw400(369997, emsg.noRelation)
		if (!rel1 || !rel2) throw400(54927423, emsg.noRelation)

		// // both relations must point to junction table
		// if (rel1.leftTable !== rel2.leftTable) throw400(91942132,)

		// We update mtmFkName with fk of the other side
		await this.repoManager.transaction({
			fn: async (trx) => {
				if (rel1.otherSide.relationId) {
					await this.repo.updateById({
						trx,
						id: rel1.otherSide.relationId,
						changes: { mtmFkName: rel2.relation.fkName },
					})
				}

				if (rel2.otherSide.relationId) {
					await this.repo.updateById({
						trx,
						id: rel2.otherSide.relationId,
						changes: { mtmFkName: rel1.relation.fkName },
					})
				}

				const compositeKeys = await this.schemaInfo.getCompositeUniqueKeys({
					table: rel1.tableName,
					trx,
				})

				const uniqueKeyExists = compositeKeys.some((key) =>
					isEqual(
						alphabetical(key.columnNames, (v) => v),
						alphabetical([rel1.columnName, rel2.columnName], (v) => v),
					),
				)

				if (uniqueKeyExists) return

				await this.alterSchema.createUniqueKey({
					tableName: rel1.tableName,
					columnNames: [rel1.columnName, rel2.columnName],
					trx,
				})
			},
		})
		// return rel1
	}

	/**
	 *
	 * @param relationId
	 * @returns
	 */
	async splitManyToMany(junctionCollection: string): Promise<void> {
		// const col = this.infraState.getCollection(junctionCollection) ?? throw404(788933)
		const relations = this.infraState.relations.filter(
			(r): r is JunctionRelation =>
				r.type === "many-to-many" && r.junction.collectionName === junctionCollection,
		)

		// if (moreRel.length > 0) throw500(769932)

		// if (!rel1 || !rel2) throw400(3798973, emsg.mtmSplitInvalid)
		if (relations.length === 0) throw400(42389, emsg.noRelation)
		const firstRel = relations[0]!

		await this.repoManager.transaction({
			fn: async (trx): Promise<void> => {
				// remove mtmFk for every relation that is included in this.
				// this will delete left and right table mtmFk
				await this.repo.updateWhere({
					trx: trx,
					where: { id: { $in: relations.map((r) => r.id) } },
					changes: { mtmFkName: null },
				})

				await this.alterSchema.dropUniqueKey({
					columnNames: relations.map((r) => r.junction!.thisSide!.columnName) as [
						string,
						...string[],
					],
					tableName: firstRel.junction.tableName,
					indexName: firstRel.junction.uniqueKey,
					trx,
				})
			},
		})
	}
}
