import { z } from "zod"
import { zodCreate } from "./zod-create"

export type ZodDtoClass<T extends z.ZodTypeAny> = {
	// so we know it's zod dto in NestJS
	zodDto: true
	new (param: z.input<T>): z.output<T>
	zodSchema: T
	fromUnknown(data: unknown): z.output<T>
	fromPartial(data?: Partial<z.input<T>>): z.output<T>
}

class ZodDtoBase {}

/**
 * Not the biggest fan of this. This had sense when I used Nest's constructor from
 * types, but I'm not anymore, and this is looking superfluous.
 * God things is that this is a full type,
 * so I do not have to write z.infer<typeof Schema>, or to keep 2 values
 */
export function ZodDto<T extends z.ZodTypeAny>(zodSchema: T): ZodDtoClass<T> {
	return class ZodDtoInner extends ZodDtoBase {
		constructor(data: z.input<T>) {
			super()
			const result = zodCreate(zodSchema, data)
			Object.assign(this, result)
		}

		public static readonly zodDto = true

		public static readonly zodSchema = zodSchema

		public static fromUnknown(data: unknown): ZodDtoInner {
			return new ZodDtoInner(data)
		}

		public static fromPartial(data?: Partial<z.input<T>>): ZodDtoInner {
			return new ZodDtoInner(data ?? {})
		}
	}
}

export type ZodDtoInput<D extends ZodDtoClass<T>, T extends z.ZodTypeAny = z.ZodTypeAny> = z.input<
	D["zodSchema"]
>
