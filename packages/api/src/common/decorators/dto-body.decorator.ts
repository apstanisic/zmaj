import { createParamDecorator, ExecutionContext } from "@nestjs/common"
import type { ZodDtoClass } from "@zmaj-js/common"
import { isNil } from "@zmaj-js/common"
import { throw500 } from "../throw-http"

export const DtoBody = createParamDecorator((ZodClass: ZodDtoClass<any>, ctx: ExecutionContext) => {
	const request = ctx.switchToHttp().getRequest()
	const body = request.body
	if (isNil(ZodClass)) throw500(793332)
	return new ZodClass(body)
})
