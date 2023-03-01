import { buildTestModule } from "@api/testing/build-test-module"
import { TestingModule } from "@nestjs/testing"
import { beforeEach, describe, expect, it } from "vitest"
import { UsersListener } from "./users.listener"

describe("UsersListener", () => {
	let module: TestingModule
	let listener: UsersListener

	beforeEach(async () => {
		module = await buildTestModule(UsersListener).compile()
		//
		listener = module.get(UsersListener)
	})

	it("should be defined", () => {
		expect(listener).toBeInstanceOf(UsersListener)
	})
})
