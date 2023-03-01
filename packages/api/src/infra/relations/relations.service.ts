import { throw400, throw404, throw500 } from "@api/common/throw-http"
import { OrmRepository } from "@api/database/orm-specs/OrmRepository"
import { RepoManager } from "@api/database/orm-specs/RepoManager"
import { emsg } from "@api/errors"
import { Injectable } from "@nestjs/common"
import {
	RelationMetadata,
	RelationMetadataCollection,
	RelationCreateDto,
	RelationUpdateDto,
	RelationDef,
	UUID,
} from "@zmaj-js/common"
import { InfraStateService } from "../infra-state/infra-state.service"
import { OnInfraChangeService } from "../on-infra-change.service"
import { DirectRelationService } from "./direct-relations.service"
import { ManyToManyRelationsService } from "./many-to-many-relations.service"

type MtmRelationSides = [RelationDef] | [RelationDef, RelationDef]

@Injectable()
export class RelationsService {
	constructor(
		private readonly repoManger: RepoManager,
		private readonly infraState: InfraStateService,
		private readonly onInfraChange: OnInfraChangeService,
		private readonly directRelationsService: DirectRelationService,
		private readonly mtmService: ManyToManyRelationsService,
	) {
		this.repo = this.repoManger.getRepo(RelationMetadataCollection)
	}

	private repo: OrmRepository<RelationMetadata>

	private getPropertyName(dto: RelationCreateDto, side: "left" | "right"): string {
		const currentTable = side === "left" ? dto.leftTable : dto.rightTable
		// const otherTable = side === "left" ? dto.rightTable : dto.leftTable
		const propertyName = side === "left" ? dto.leftPropertyName : dto.rightPropertyName

		const collection =
			this.infraState.getCollection(currentTable) ?? throw400(3293793, emsg.noCollection)

		// if (propertyName) {
		const taken = collection.fields[propertyName] ?? collection.relations[propertyName]
		if (taken) throw400(73294, emsg.propertyTaken(propertyName))
		return propertyName
		// }

		// for (let i = 1; i < 50; i++) {
		// 	const property = camelCase(otherTable) + (i === 1 ? "" : i)
		// 	const taken = collection.properties[property]
		// 	if (!taken) return property
		// }
		// throw400(73392423)
	}

	/**
	 * Create new relation
	 *
	 * @param dto Info that is needed to create new relation
	 * @returns Created relation
	 */
	async createRelation(dto: RelationCreateDto): Promise<RelationDef> {
		dto.leftPropertyName = this.getPropertyName(dto, "left")
		dto.rightPropertyName = this.getPropertyName(dto, "right")

		const created = await this.onInfraChange.executeChange(async () => {
			const relation =
				dto.type === "many-to-many"
					? await this.mtmService.createRelation(dto)
					: await this.directRelationsService.createRelation(dto)
			return relation
		})

		return this.getRelationFromState(created.id) ?? throw500(3902212)
	}

	private getRelationFromState(id: string): RelationDef | undefined {
		return this.infraState.relations.find((r) => r.id === id)
	}
	/**
	 * Update relation
	 *
	 * @param id Relation ID
	 * @param body Data that can be changed
	 * @returns Updated relation (expanded)
	 */
	async updateRelation(id: UUID, body: RelationUpdateDto): Promise<RelationDef> {
		await this.onInfraChange.executeChange(() => this.repo.updateById({ id, changes: body }))
		return this.getRelationFromState(id) ?? throw500(789023)
	}

	/**
	 * Removes relation and it's foreign keys.
	 * If relation is m2m,  2 fk will be removed
	 * If you want to split m2m to 2 m2o, use `splitManyToMany`
	 * We don't need to delete relation from db. Infra will delete it when it sees that it's missing fk
	 * @param id
	 * @returns
	 */
	async deleteRelation(id: UUID): Promise<RelationDef> {
		const relation = this.getRelationFromState(id) ?? throw404(96234, emsg.noRelation)

		await this.onInfraChange.executeChange(async () => {
			if (relation.type === "many-to-many") {
				await this.mtmService.deleteRelation(relation)
			} else {
				await this.directRelationsService.deleteRelation(relation)
			}
		})

		return relation
	}

	async splitManyToMany(junctionCollection: string): Promise<MtmRelationSides> {
		await this.onInfraChange.executeChange(async () =>
			this.mtmService.splitManyToMany(junctionCollection),
		)

		const relations = this.infraState.relations.filter(
			(r) => r.otherSide.collectionName === junctionCollection,
		)
		if (relations.length < 1) throw500(799362)
		return relations as MtmRelationSides
	}

	/**
	 *
	 * @param relationId1 Left relation in junction table
	 * @param relationId2 Right relation in junction table
	 * @returns Joined relation
	 */
	async joinManyToMany(junctionCollection: string): Promise<MtmRelationSides> {
		await this.onInfraChange.executeChange(async () =>
			this.mtmService.joinManyToMany(junctionCollection),
		)

		const relations = this.infraState.relations.filter(
			(r) => r.type === "many-to-many" && r.junction.collectionName === junctionCollection,
		)
		if (relations.length < 1) throw500(799362)
		return relations as MtmRelationSides
	}
}
