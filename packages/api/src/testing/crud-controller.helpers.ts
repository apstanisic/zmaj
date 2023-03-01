import { CrudController } from "@api/common"
import { CrudRequestStub } from "@api/common/decorators/crud-request.stub"
import { CrudService } from "@api/crud/crud.service"
import { Struct, times } from "@zmaj-js/common"
import { isEmpty } from "radash"
import { v4 } from "uuid"
import { expect, vi } from "vitest"

// This functions are simple tests for crud controllers.
// It ensures consistent naming convention, and that it only calls service that
// handle logic. It reduces boilerplate of having to write same test for crud methods,
// since they all almost always the same for every controller

type Params<Controller> = {
	service: CrudService<any>
	controller: Controller
}
//

/**
 * Test CRUD find by ID
 */
export async function testFindById({
	service,
	controller,
}: Params<Pick<CrudController, "findById">>): Promise<void> {
	const mockMeta = CrudRequestStub()
	const item = { id: v4() }

	const findById = vi.fn(async () => item)

	service.findById = findById

	const res = await controller.findById(mockMeta)

	expect(findById).toHaveBeenCalledWith(mockMeta)

	expect(res).toEqual({ data: item })
}

/**
 * Test CRUD find many
 */
export async function testFindMany({
	service,
	controller,
}: Params<Pick<CrudController<any>, "findMany">>): Promise<void> {
	const mockMeta = CrudRequestStub()
	const items = times(5, () => ({ id: v4() }))
	const result = { count: items.length, data: items }

	const findMany = vi.fn(async () => result)

	service.findMany = findMany

	const res = await controller.findMany(mockMeta)

	expect(findMany).toHaveBeenCalledWith(mockMeta)

	expect(res).toEqual(result)
}

/**
 * Test CRUD create one
 */
export async function testCreateOne({
	service,
	controller,
	...params
}: Params<Pick<CrudController, "createOne">> & { dto?: true; factory?: true }): Promise<void> {
	const mockMeta = CrudRequestStub()
	const item = { id: v4() }

	const createOne = vi.fn(async () => item)

	service.createOne = createOne

	// vi.spyOn(service.crud, 'createOne').mockResolvedValueOnce(item)
	const res = await controller.createOne(mockMeta, { someVal: 1 })

	const other: Struct = {}
	if (params.dto) other["dto"] = expect.objectContaining({})
	if (params.factory) other["factory"] = expect.anything()

	if (!isEmpty(other)) {
		expect(createOne).toHaveBeenCalledWith(mockMeta, expect.objectContaining(other))
	} else {
		expect(createOne).toHaveBeenCalledWith(mockMeta)
	}
	expect(res).toEqual({ data: item })
}

export async function testDeleteById({
	service,
	controller,
}: Params<Pick<CrudController, "deleteById">>): Promise<void> {
	const mockMeta = CrudRequestStub()
	const item = { id: 5 }

	const deleteById = vi.fn(async () => item)

	service.deleteById = deleteById

	// vi.spyOn(service.crud, 'deleteById').mockResolvedValueOnce(item)
	const res = await controller.deleteById(mockMeta)

	expect(deleteById).toHaveBeenCalledWith(mockMeta)
	expect(res).toEqual({ data: item })
}

export async function testUpdateById({
	service,
	controller,
	dto,
}: Params<Pick<CrudController, "updateById">> & { dto?: true }): Promise<void> {
	const mockMeta = CrudRequestStub()
	const item = { id: 5 }
	const updateById = vi.fn(async () => item)

	service.updateById = updateById

	const res = await controller.updateById(mockMeta, { dto: 1 })
	if (dto !== true) {
		expect(service.updateById).toHaveBeenCalledWith(mockMeta)
	} else {
		expect(service.updateById).toHaveBeenCalledWith(mockMeta, { changes: { dto: 1 } })
	}
	expect(res).toEqual({ data: item })
}

export const TestCrudControllers = {
	testUpdateById,
	testDeleteById,
	testCreateOne,
	testFindById,
	testFindMany,
}
