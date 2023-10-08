import { Injectable, Logger } from "@nestjs/common"
import { Struct, filterStruct, isNumberString, isStruct } from "@zmaj-js/common"
import dotenv from "dotenv"
import flat from "flat"
import { readFileSync } from "fs"
import ms from "ms"
import { isAbsolute } from "node:path/posix"
import { join as joinPath } from "path"
import { camel, isInt, mapKeys, mapValues } from "radash"
import { z } from "zod"
import { ConfigModuleConfig } from "./config.config"

export type EnvValue = string | number | boolean | Date | null | undefined

const StructSchema = z.record(z.unknown())

@Injectable()
export class ConfigService {
	logger = new Logger(ConfigService.name)

	/** Parsed values */
	private parsed: Struct<EnvValue>

	private rawValues: Struct<string> = {}

	constructor(private readonly config: ConfigModuleConfig) {
		const valuesFromFile = this.readEnvFile()

		const fromProcess = this.config.useProcessEnv ? (process.env as Struct<string>) : {}

		// `process.env` has priority over env file
		this.rawValues = { ...valuesFromFile, ...fromProcess }

		this.parsed = this.castValuesToProperTypes(this.rawValues)
	}

	/** Read env values from file */
	private readEnvFile(): Struct<string> {
		if (this.config.envPath === null) return {}

		const envPath = this.config.envPath

		const fullPath = isAbsolute(envPath) ? envPath : joinPath(process.cwd(), envPath)

		let fileValue: Buffer

		try {
			fileValue = readFileSync(fullPath)
		} catch (error) {
			this.logger.warn("Config file does not exist")
			throw error
		}

		// I have to handle reading file by myself
		const values = dotenv.parse(fileValue)

		if (this.config.assignEnvFileToProcessEnv) {
			for (const [key, val] of Object.entries(values)) {
				process.env[key] ??= val
			}
		}

		return values
	}

	/** Get value by key. It get's parsed value, not only string */
	// get<T extends ParsedEnvValue = ParsedEnvValue>(key: string): T | undefined {
	get<T extends EnvValue = EnvValue>(key: string): T | undefined {
		return this.parsed[key] as T | undefined
	}

	/** Get all values */
	getAll(): Readonly<Struct<EnvValue>> {
		return this.parsed
	}

	/**
	 * Get array of structs
	 *
	 * @example
	 * ```js
	 * // STORAGE_PROVIDERS=aws_custom,minio,local
	 * // STORAGE_PROVIDERS__AWS_CUSTOM__TYPE=s3
	 * // STORAGE_PROVIDERS__MINIO__TYPE=s3
	 * // STORAGE_PROVIDERS__LOCAL__TYPE=local
	 * const data = getGroups('STORAGE_PROVIDERS')
	 * // data === { minio: {type: 's3'}, awsCustom: {type: 's3'}, local: {type: 'local' } }
	 * ```
	 *
	 * @param key Name of group (STORAGE, OIDC...)
	 * @returns all found structs
	 */
	getGroups(key: string): Struct<Struct> {
		const fromJson = this.getJsonGroups(key)

		const groups = this.get<string>(key)
			?.split(",")
			.map((name) => name.trim().toUpperCase())

		// has to filter, since I can't control the order, and overwrite is problematic
		// bellow does not work with overwrite, since TEST_ID will be overwrites with TEST
		// so I have to filter and remove TEST value
		// TEST_ID=5
		// TEST=10
		// TEST_NAME=1
		const allNested = flat.unflatten<Struct, Struct>(
			filterStruct(this.parsed, (_v, k) => k.startsWith(`${key}__`)),
			{ delimiter: "__" },
		)

		// get all nested values for current key
		const nested = allNested[key]
		if (!isStruct(nested)) return fromJson
		const all = { ...fromJson, ...nested }

		// return mapValues(group, v => v)
		// const specifiedGroups = val ? val.split(",").map((v) => v.trim().toUpperCase()) : undefined
		const obj = mapValues(all, (v) =>
			!isStruct(v)
				? null
				: StructSchema.transform((group) => mapKeys(group, (k) => camel(k))).parse(v),
		)
		const valid = filterStruct(obj, (val) => val !== null) as Struct<Struct>
		if (groups) {
			return Object.fromEntries(groups.map((name) => [name, valid[name] ?? {}]))
		} else {
			return valid
		}
	}

	private getJsonGroups(key: string): Struct<Struct> {
		const all = this.rawValues
		const groups = filterStruct(
			all,
			(_, envKey) => envKey.startsWith(`${key}_`) && !envKey.startsWith(`${key}__`),
		)
		const removedPrefix = mapKeys(groups, (k) => k.replace(`${key}_`, ""))
		return mapValues(removedPrefix, (val) => StructSchema.parse(JSON.parse(val ?? "{}")))
	}

	/**
	 * Cast values to their type
	 *
	 * number string to float ('10' -> 10)
	 * 'true' or 'false' to boolean
	 * ms date to ms (1m -> 60000)
	 */
	private castValuesToProperTypes(rawValues: Struct<string>): Struct<EnvValue> {
		const parsed: Struct<EnvValue> = {}
		for (const [key, value] of Object.entries(rawValues)) {
			let parsedValue: EnvValue

			// If you don't want to parse value, start it with underscore "_"
			// Examples: _250 => "250", __250 => "_250", _null => "null", __null => "_null"
			if (value.charAt(0) === "_") {
				parsedValue = value.substring(1)
			} else if (value === "true" || value === "false") {
				parsedValue = value === "true"
			} else if (value.toLowerCase() === "null") {
				parsedValue = null
			} else if (value.toLowerCase() === "undefined" || value === "") {
				parsedValue = undefined
			} else if (isInt(ms(value))) {
				parsedValue = ms(value)
			} else if (isNumberString(value)) {
				parsedValue = parseFloat(value)
			} else {
				parsedValue = value
			}

			parsed[key] = parsedValue
		}
		return parsed
	}
}
