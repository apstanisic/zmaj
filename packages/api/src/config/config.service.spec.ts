import dotenv from "dotenv"
import { readFileSync } from "fs"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { ConfigModuleConfig } from "./config.config"
import { ConfigService } from "./config.service"

vi.mock("fs", () => ({ readFileSync: vi.fn(() => "FROM_FS=true") }))

vi.mock("dotenv", () => ({
	default: {
		parse: vi.fn(() => ({
			TEST_VAL: "HELLO_WORLD",
			TEST_PORT: "8000",
			HELLO_WORLD: "hello",
			SUPER_VALUE: "Super",
			AS_MS: "15d",
			STORAGE_PROVIDERS: "pr1,pr2",
			PR_1__STORAGE_NAME: "test1",
			PR_2__STORAGE_NAME: "test2",
		})),
	},
}))

describe("ConfigService", () => {
	let service: ConfigService

	beforeEach(async () => {
		service = new ConfigService(
			new ConfigModuleConfig({ envPath: ".env", useProcessEnv: false }),
		)
		// clear dotenv mocks after assigning to default service
		vi.clearAllMocks()
	})

	it("should be defined", () => {
		expect(service).toBeInstanceOf(ConfigService)
	})

	/**
	 *
	 */
	describe("constructor", () => {
		it("should ignore process env", () => {
			const s1 = new ConfigService(new ConfigModuleConfig({ useProcessEnv: false }))
			expect(s1.get("NODE_ENV")).toBeUndefined()

			const s2 = new ConfigService(new ConfigModuleConfig({ useProcessEnv: true }))
			expect(s2.get("NODE_ENV")).toEqual("test")
		})

		it("should ignore env file", () => {
			new ConfigService(new ConfigModuleConfig({}))
			expect(dotenv.parse).not.toBeCalled()
		})

		it("should pass data from file to be processed", () => {
			new ConfigService(new ConfigModuleConfig({ envPath: ".env" }))
			expect(dotenv.parse).toBeCalledWith("FROM_FS=true")
		})

		it("should read from proper file", () => {
			new ConfigService(new ConfigModuleConfig({ envPath: "/root.env" }))
			expect(readFileSync).toBeCalledWith("/root.env")

			new ConfigService(new ConfigModuleConfig({ envPath: "relative.env" }))
			expect(readFileSync).toBeCalledWith(process.cwd() + "/relative.env")
		})

		it("should have higher priority in process.env", () => {
			process.env["TEST_VAL"] = "HELLO_TEST"
			const config = new ConfigService(new ConfigModuleConfig({ useProcessEnv: true }))
			expect(config.get("TEST_VAL")).toEqual("HELLO_TEST")
		})
	})

	/**
	 *
	 */
	describe("get", () => {
		it("returns value", () => {
			expect(service.get("TEST_VAL")).toBe("HELLO_WORLD")
		})

		it("returns undefined if value does not exists", () => {
			expect(service.get("UNKNOWN_KEY")).toBe(undefined)
		})
	})

	/**
	 *
	 */
	describe("getAll", () => {
		it("should return all values", () => {
			expect(service.getAll()).toEqual(service["parsed"])
		})
	})

	/**
	 *
	 */
	describe("getGroups", () => {
		it("should get all values in group if keys not specified", () => {
			service["parsed"] = {
				// STORAGE_PROVIDERS: "AWS_CUSTOM,MINIO,LOCAL",
				STORAGE_PROVIDERS__AWS_CUSTOM__TYPE: "s3",
				STORAGE_PROVIDERS__MINIO__TYPE: "s3",
				STORAGE_PROVIDERS__MINIO__ACCESS_KEY: "test_key",
				STORAGE_PROVIDERS__LOCAL__TYPE: "local",
				STORAGE_PROVIDERS__LOCAL__NAME: "hello",
				// invalid
				STORAGE_PROVIDERS_TEST_ONE: "aws_custom,minio,local",
				STORAGE_PROVIDERS__TEST_TWO: "aws_custom,minio,local",
			}
			// service.get = vi.fn().mockReturnValue([])
			const values = service.getGroups("STORAGE_PROVIDERS")

			expect(values).toEqual({
				AWS_CUSTOM: { type: "s3" },
				MINIO: { type: "s3", accessKey: "test_key" },
				LOCAL: { type: "local", name: "hello" },
			})
		})
		it("should get only specified if keys provided", () => {
			service["parsed"] = {
				STORAGE_PROVIDERS: "ONE,TWO",
				STORAGE_PROVIDERS__ONE__TYPE: "s3",
				STORAGE_PROVIDERS__TWO__TYPE: "s3",
				STORAGE_PROVIDERS__THREE__TYPE: "s3",
			}
			// service.get = vi.fn().mockReturnValue([])
			const values = service.getGroups("STORAGE_PROVIDERS")

			expect(values).toEqual({
				ONE: { type: "s3" },
				TWO: { type: "s3" },
			})
		})

		it("should return empty group if values not provided", () => {
			service["parsed"] = {
				STORAGE_PROVIDERS: "ONE,TWO",
				STORAGE_PROVIDERS__ONE__TYPE: "s3",
			}
			// service.get = vi.fn().mockReturnValue([])
			const values = service.getGroups("STORAGE_PROVIDERS")

			expect(values).toEqual({
				ONE: { type: "s3" },
				TWO: {},
			})
		})
		it("should also get json values", () => {
			//
			service["parsed"] = {
				STORAGE_PROVIDERS__ONE__TYPE: "s3",
			}
			service["rawValues"] = {
				STORAGE_PROVIDERS_JSON: `{"hello":"world"}`,
			}
			const values = service.getGroups("STORAGE_PROVIDERS")

			expect(values).toEqual({
				ONE: { type: "s3" },
				JSON: { hello: "world" },
			})
		})
	})

	/**
	 *
	 */
	describe("getJsonGroups", () => {
		it("should get all values in group", () => {
			service["rawValues"] = {
				HELLO_WORLD_GROUP1: JSON.stringify({ test: "value" }),
				HELLO_WORLD_TEST: JSON.stringify({ my: 5 }),
			}
			// service.get = vi.fn().mockReturnValue([])
			const values = service["getJsonGroups"]("HELLO_WORLD")

			expect(values).toEqual({
				GROUP1: { test: "value" },
				TEST: { my: 5 },
			})
		})
	})

	/**
	 *
	 */
	describe("castValuesToProperTypes", () => {
		it("casts values to proper types", () => {
			const values = {
				rawValue: "_null",
				boolTrue: "true",
				boolFalse: "false",
				null: "null",
				undefined: "",
				empty: "undefined",
				int: "123",
				float: "123.5",
				date: "1000ms",
				string: "hello world",
			}

			expect(service["castValuesToProperTypes"](values)).toEqual({
				boolFalse: false,
				boolTrue: true,
				date: 1000,
				empty: undefined,
				undefined: undefined,
				float: 123.5,
				int: 123,
				null: null,
				rawValue: "null",
				string: "hello world",
			})
		})
	})
})
