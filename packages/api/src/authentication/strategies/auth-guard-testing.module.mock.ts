import { Controller, Get, Module } from "@nestjs/common"
import { AuthUser } from "@zmaj-js/common"
import { GetUser } from "../get-user.decorator"

/**
 * in separate file because vscode-jest extension does not work if there are decorators present
 * It is used to test guards e2e by getting auth user and returning it. This way
 * we can check if guard "injected" user
 */
@Controller("test-auth")
class GetUserTestController {
	@Get("current-user")
	test(@GetUser() user?: AuthUser): { user: AuthUser | null } {
		return { user: user ?? null }
	}
}

@Module({ controllers: [GetUserTestController] })
export class AuthGuardTestingModule {}
