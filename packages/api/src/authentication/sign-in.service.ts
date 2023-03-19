import { DtoBody } from "@api/common/decorators/dto-body.decorator"
import { Get, Injectable, Post } from "@nestjs/common"
import { AuthUser, StructDto, SignInDto } from "@zmaj-js/common"
import { GetUser } from "./get-user.decorator"
import { MfaService } from "./mfa/mfa.service"
import { RequestMfaPrompt } from "./mfa/request-mfa-prompt.type"
import { UsersMfaService } from "./mfa/users-mfa.service"

@Injectable()
export class SignInService {
	constructor(private mfa: MfaService, private userMfa: UsersMfaService) {}

	test() {
		this.userMfa.authUserHasMfa()
	}
}
