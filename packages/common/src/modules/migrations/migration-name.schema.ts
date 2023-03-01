import { migrationNameRegex } from "@common/regexes"
import { format } from "date-fns"
import { isString } from "radash"
import { z } from "zod"
import { DbMigrationName } from "./migration-name.type"

export const MigrationNameSchema = z
	.preprocess(
		(v) => {
			const val = v ?? "generated_migration"
			if (!isString(val)) return val

			const withDate = migrationNameRegex.test(val)
			if (withDate) return val

			const date = format(new Date(), "yyyy_MM_dd_HH_mm_ss")
			console.log(`${date}__${val.trim()}`)

			return `${date}__${val.trim()}`
		}, //
		z.string().min(1).max(200).regex(migrationNameRegex, "Invalid migration name"),
	)
	// cast type so returned value from schema can be assigned to normal db migration object
	.transform((v) => v as DbMigrationName)
