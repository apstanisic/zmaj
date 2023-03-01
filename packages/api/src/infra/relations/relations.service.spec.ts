import { buildTestModule } from "@api/testing/build-test-module"
import { BadRequestException, NotFoundException } from "@nestjs/common"
import {
	RelationCreateDto,
	JunctionRelation,
	RelationDef,
	snakeCase,
	times,
	UUID,
} from "@zmaj-js/common"
import { RelationDefStub } from "@zmaj-js/test-utils"
import { WritableDeep } from "type-fest"
import { v4 } from "uuid"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { InfraStateService } from "../infra-state/infra-state.service"
import { OnInfraChangeService } from "../on-infra-change.service"
import { RelationsService } from "./relations.service"

describe("RelationsService", () => {
	let service: RelationsService
	let infraState: InfraStateService
	let onInfraChange: OnInfraChangeService

	beforeEach(async () => {
		const module = await buildTestModule(RelationsService).compile()
		service = module.get(RelationsService)
		infraState = module.get(InfraStateService)
		onInfraChange = module.get(OnInfraChangeService)

		onInfraChange.syncAppAndDb = vi.fn()
		onInfraChange.executeChange = vi.fn(async (fn) => fn())
	})

	it("should compile", () => {
		expect(service).toBeDefined()
	})

	/**
	 *
	 */
	describe("getPropertyName", () => {
		let dto: RelationCreateDto

		beforeEach(() => {
			dto = new RelationCreateDto({
				leftColumn: "post_id6",
				leftTable: "comments",
				rightTable: "posts",
				rightColumn: "id",
				type: "many-to-one",
				leftPropertyName: "postProp",
				rightPropertyName: "commentsProp",
			})
		})

		it("should throw if collection does not exist", () => {
			dto.leftTable = "non_exist"
			expect(() => service["getPropertyName"](dto, "left")).toThrow(BadRequestException)
		})

		it("should throw if name is provided and taken", () => {
			dto.leftPropertyName = "body"
			expect(() => service["getPropertyName"](dto, "left")).toThrow(BadRequestException)
		})

		it("should return name if free", () => {
			dto.leftPropertyName = "freeProp"
			const res = service["getPropertyName"](dto, "left")
			expect(res).toEqual("freeProp")
		})

		// it("should return first free name without number", () => {
		// 	const res = service["getPropertyName"](dto, "left")
		// 	expect(res).toEqual("postsProp")
		// })

		// it("should return first free name", () => {
		// 	infraState.collections.comments!.properties["posts"] = {} as any
		// 	const res = service["getPropertyName"](dto, "left")
		// 	expect(res).toEqual("posts2")
		// })

		// it("should throw if 50 names are invalid", () => {
		// 	infraState.collections.comments!.properties["posts"] = {} as any
		// 	for (let i = 0; i < 50; i++) {
		// 		infraState.collections.comments!.properties["posts" + i] = {} as any
		// 	}
		// 	expect(() => service["getPropertyName"](dto, "left")).toThrow(BadRequestException)
		// })
	})

	/**
	 *
	 */
	describe("createRelation", () => {
		let dto: RelationCreateDto

		beforeEach(() => {
			dto = new RelationCreateDto({
				leftColumn: "lc",
				leftTable: "lt",
				rightTable: "rt",
				rightColumn: "rc",
				type: "many-to-one",
				leftPropertyName: "lpn",
				rightPropertyName: "rpn",
			})
			service["directRelationsService"].createRelation = vi.fn().mockResolvedValue({ id: 5 })
			service["mtmService"].createRelation = vi.fn().mockResolvedValue({ id: 3 })
			service["getRelationFromState"] = vi.fn((id) => ({ full: true, id }) as any)
			service["getPropertyName"] = vi.fn((_, side) => `property_${side}`)
		})

		it("should modify dto to set proper property names", async () => {
			await service.createRelation(dto)

			expect(dto.leftPropertyName).toEqual("property_left")
			expect(dto.rightPropertyName).toEqual("property_right")

			expect(service["directRelationsService"].createRelation).toBeCalledWith(
				expect.objectContaining({
					leftPropertyName: "property_left",
					rightPropertyName: "property_right",
				}),
			)
		})

		it("should call direct service if dto is not m2m", async () => {
			await service.createRelation(dto)
			expect(service["directRelationsService"].createRelation).toBeCalledWith(dto)
		})

		it("should call mtm service if dto is m2m", async () => {
			dto.type = "many-to-many"
			await service.createRelation(dto)
			expect(service["mtmService"].createRelation).toBeCalledWith(dto)
			//
		})

		it("should sync infra", async () => {
			await service.createRelation(dto)
			expect(onInfraChange.executeChange).toBeCalled()
		})

		it("should sync return created relation", async () => {
			const res = await service.createRelation(dto)
			expect(res).toEqual({ id: 5, full: true })
		})
	})

	/**
	 *
	 */
	describe("getRelationFromState", () => {
		it("should get relation from state", () => {
			infraState["_relations"] = times(10, (i) => ({ id: String(i), full: true }) as any)
			const res = service["getRelationFromState"]("6")
			expect(res).toEqual({ full: true, id: "6" })
		})
	})

	/**
	 *
	 */
	describe("updateRelation", () => {
		const relationId = v4() as UUID
		const updateById = vi.fn()

		beforeEach(() => {
			service["repo"].updateById = updateById
			service["getRelationFromState"] = vi.fn().mockImplementation((id) => ({ id, full: true }))
		})
		//
		it("should update relation info in db", async () => {
			await service.updateRelation(relationId, { label: "hello" })
			expect(updateById).toBeCalledWith({
				id: relationId,
				changes: { label: "hello" },
			})
		})

		it("should sync infra state", async () => {
			await service.updateRelation(relationId, {})
			expect(onInfraChange.executeChange).toBeCalled()
		})

		it("should return updated relation", async () => {
			const res = await service.updateRelation(relationId, { label: "hello" })
			expect(res).toEqual({ id: relationId, full: true })
		})
	})

	/**
	 *
	 */
	describe("deleteRelation", () => {
		const id = "123" as UUID
		let relation: WritableDeep<RelationDef>

		beforeEach(() => {
			relation = RelationDefStub()
			service["getRelationFromState"] = vi.fn().mockReturnValue(relation)
			service["mtmService"].deleteRelation = vi.fn()
			service["directRelationsService"].deleteRelation = vi.fn()
		})

		it("should throw if relation does not exist", async () => {
			service["getRelationFromState"] = vi.fn().mockReturnValue(undefined)
			await expect(service.deleteRelation(id)).rejects.toThrow(NotFoundException)
		})

		it("should call direct service if dto is not m2m", async () => {
			relation.type = "many-to-one"
			await service.deleteRelation(id)
			expect(service["directRelationsService"].deleteRelation).toBeCalledWith(relation)
		})

		it("should call mtm service if dto is m2m", async () => {
			relation.type = "many-to-many"
			await service.deleteRelation(id)
			expect(service["mtmService"].deleteRelation).toBeCalledWith(relation)
			//
		})

		it("should sync infra", async () => {
			await service.deleteRelation(id)
			expect(onInfraChange.executeChange).toBeCalled()
		})

		it("should return deleted relation", async () => {
			const res = await service.deleteRelation(id)
			expect(res).toEqual(relation)
		})
	})

	/**
	 *
	 */
	describe("splitManyToMany", () => {
		const buildOtherSideForJunction = (junctionCollection: string): RelationDef["otherSide"] => ({
			collectionName: junctionCollection,
			tableName: snakeCase(junctionCollection),
			columnName: "id",
			fieldName: "id",
		})
		const junctionCollection = "postsTags"
		beforeEach(() => {
			service["mtmService"].splitManyToMany = vi.fn()
			// after split state should be like this
			infraState["_relations"] = [
				RelationDefStub({ otherSide: buildOtherSideForJunction(junctionCollection) }),
				RelationDefStub({ otherSide: buildOtherSideForJunction(junctionCollection) }),
				RelationDefStub(),
				RelationDefStub(),
			]
		})

		it("should call service to split relation", async () => {
			await service.splitManyToMany(junctionCollection)
			expect(service["mtmService"].splitManyToMany).toBeCalledWith(junctionCollection)
		})

		it("should refresh infra", async () => {
			await service.splitManyToMany(junctionCollection)
			expect(onInfraChange.executeChange).toBeCalled()
		})

		it("should return updated relation", async () => {
			const res = await service.splitManyToMany(junctionCollection)
			expect(res).toEqual(infraState.relations.slice(0, 2))
		})
	})

	/**
	 *
	 */
	describe("joinManyToMany", () => {
		const junction = "postsTags"

		beforeEach(() => {
			service["mtmService"].joinManyToMany = vi.fn()
			// after join state should be like this
			const buildJunctionPart = (colName: string): JunctionRelation["junction"] => ({
				collectionName: colName,
				tableName: snakeCase(colName),
				collectionAuthzKey: "test",
				otherSide: { columnName: "id", fieldName: "id" },
				thisSide: { columnName: "id", fieldName: "id" },
				uniqueKey: "qwer",
			})

			infraState["_relations"] = [
				RelationDefStub({ junction: buildJunctionPart(junction), type: "many-to-many" }),
				RelationDefStub({ junction: buildJunctionPart(junction), type: "many-to-many" }),
				RelationDefStub(),
				RelationDefStub(),
			]
		})

		it("should join many to many", async () => {
			await service.joinManyToMany(junction)
			expect(service["mtmService"].joinManyToMany).toBeCalledWith(junction)
		})

		it("should refresh infra", async () => {
			await service.joinManyToMany(junction)
			expect(onInfraChange.executeChange).toBeCalled()
		})

		it("should return updated relation", async () => {
			const res = await service.joinManyToMany(junction)
			expect(res).toEqual(infraState.relations.slice(0, 2))
		})
	})
})
