import { Injectable, PipeTransform } from "@nestjs/common"

/**
 * Ensure that value is string
 */
@Injectable()
export class ParseStringPipe implements PipeTransform<unknown, string> {
	transform(value: unknown): string {
		if (typeof value === "object") return JSON.stringify(value)
		return String(value)
	}
}
