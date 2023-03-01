import { emsg } from "@api/errors"
import { Injectable, PipeTransform } from "@nestjs/common"
import { Email, isEmail } from "@zmaj-js/common"
import { throw400 } from "./throw-http"

/**
 * Ensure that value is string
 */
@Injectable()
export class ParseEmailPipe implements PipeTransform<unknown, Email> {
	transform(value: unknown): Email {
		return isEmail(value) ? value : throw400(59992, emsg.notEmail(value))
	}
}
