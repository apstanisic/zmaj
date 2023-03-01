import { CrudRequestStub } from "@api/common/decorators/crud-request.stub"
import { CrudRequest } from "@api/common/decorators/crud-request.type"
import { buildTestModule } from "@api/testing/build-test-module"
import { BadRequestException, InternalServerErrorException } from "@nestjs/common"
import { AuthUserStub } from "@zmaj-js/test-utils"
import { beforeEach, describe, expect, it, Mock, vi } from "vitest"
import { CrudService } from "./crud.service"

describe("CrudService", () => {
	let service: CrudService
	//
	let req: CrudRequest

	beforeEach(async () => {
		const module = await buildTestModule(CrudService).compile()
		service = module.get(CrudService)

		req = CrudRequestStub({ collection: "posts", recordId: 7 })
	})

	it("should be defined", () => {
		expect(service).toBeDefined()
	})

	describe("findById", () => {
		beforeEach(() => {
			service["read"].findById = vi.fn().mockImplementation(async () => "found")
		})

		it("should throw if id is not provided", async () => {
			req.recordId = undefined
			await expect(service.findById(req)).rejects.toThrow(BadRequestException)
		})

		it("should throw if collection not provided", async () => {
			req.collection = undefined as any
			await expect(service.findById(req)).rejects.toThrow(InternalServerErrorException)
		})

		it("should find record by id", async () => {
			await service.findById(req)
			expect(service["read"].findById).toBeCalledWith(7, {
				collection: "posts",
				options: req.query,
				req,

				user: req.user,
			})
		})

		it("should return record", async () => {
			const res = await service.findById(req)
			expect(res).toEqual("found")
		})
	})

	describe("findMany", () => {
		let findWhere: Mock
		beforeEach(() => {
			findWhere = vi.fn().mockResolvedValue({ data: [1, 2], count: 2 })
			service["read"].findWhere = findWhere
		})

		it("should throw if collection is not provided", async () => {
			req.collection = undefined as any
			await expect(service.findMany(req)).rejects.toThrow(InternalServerErrorException)
		})

		it("should find relevant rows", async () => {
			await service.findMany(req)
			expect(findWhere).toBeCalledWith({
				req,
				collection: "posts",
				options: req.query,
				filter: { type: "where", where: req.query["filter"] },
				user: req.user,
			})
		})

		it("should find many", async () => {
			const res = await service.findMany(req)
			expect(res).toEqual({ data: [1, 2], count: 2 })
		})
	})

	describe("createOne", () => {
		let createOne: Mock
		beforeEach(() => {
			createOne = vi.fn().mockResolvedValue({ id: 5, name: "test" })
			service["crudWithRel"].createOne = createOne
			req.body = { name: "new" }
		})

		it("should throw if collection is not provided", async () => {
			req.collection = undefined as any
			await expect(service.createOne(req)).rejects.toThrow(InternalServerErrorException)
		})

		// crudWithRel handles this now
		// it("should throw if body is not struct", async () => {
		//   req = { ...req, body: [] as any }
		//   await expect(service.createOne(req)).rejects.toThrow(BadRequestException)
		// })

		it("should create record", async () => {
			await service.createOne(req)
			expect(createOne).toBeCalledWith(
				{ name: "new" },
				{
					req,
					collection: "posts",
					user: req.user,
				},
			)
		})

		it("should return created record", async () => {
			const res = await service.createOne(req)
			expect(res).toEqual({ id: 5, name: "test" })
		})

		it("should allow to override params", async () => {
			const user = AuthUserStub()
			await service.createOne(req, { user })
			expect(createOne).toBeCalledWith(expect.anything(), expect.objectContaining({ user }))
		})
	})

	describe("deleteById", () => {
		let deleteById: Mock

		beforeEach(() => {
			deleteById = vi.fn().mockResolvedValue({ id: 5 })
			service["del"].deleteById = deleteById
		})

		it("should throw if id not provided", async () => {
			req.recordId = undefined
			await expect(service.deleteById(req)).rejects.toThrow(InternalServerErrorException)
		})

		it("should throw if collection is not provided", async () => {
			req.collection = undefined as any
			await expect(service.deleteById(req)).rejects.toThrow(InternalServerErrorException)
		})

		it("should return deleted record", async () => {
			const res = await service.deleteById(req)
			expect(res).toEqual({ id: 5 })
		})

		it("should delete proper record", async () => {
			await service.deleteById(req)
			expect(deleteById).toBeCalledWith(7, {
				req,
				collection: "posts",

				user: req.user,
			})
		})
	})

	describe("updateById", () => {
		let updateById: Mock

		beforeEach(() => {
			updateById = vi.fn().mockResolvedValue({ id: 5 })
			service["crudWithRel"].updateById = updateById
		})

		it("should throw if id not provided", async () => {
			req.recordId = undefined
			await expect(service.updateById(req)).rejects.toThrow(InternalServerErrorException)
		})

		it("should throw if collection is not provided", async () => {
			req.collection = undefined as any
			await expect(service.updateById(req)).rejects.toThrow(InternalServerErrorException)
		})

		it("should return updated record", async () => {
			const res = await service.updateById(req)
			expect(res).toEqual({ id: 5 })
		})

		it("should update proper record", async () => {
			await service.updateById(req)
			expect(updateById).toBeCalledWith(7, {
				req,
				collection: "posts",

				user: req.user,
				changes: req.body,
			})
		})
	})
})
