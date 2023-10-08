import { emsg } from "@api/errors"
import { Injectable, PipeTransform } from "@nestjs/common"
import { DbFieldSchema } from "@zmaj-js/common"
import { throw400 } from "./throw-http"

/**
 * Ensure that value is string
 */
@Injectable()
export class ParseFieldPipe implements PipeTransform<unknown, string> {
	transform(value: unknown): string {
		try {
			return DbFieldSchema.parse(value)
		} catch (error) {
			throw400(59922, emsg.invalidPayload)
		}
	}
}
