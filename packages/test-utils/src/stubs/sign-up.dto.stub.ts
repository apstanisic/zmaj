import { randBoolean, randEmail, randFirstName, randLastName, randPassword } from "@ngneat/falso"
import { SignUpDto, Stub } from "@zmaj-js/common"

export const SignUpDtoStub = Stub(SignUpDto.zodSchema, () => ({
	email: randEmail(),
	password: randPassword(),
	firstName: randBoolean() ? undefined : randFirstName(),
	lastName: randBoolean() ? undefined : randLastName(),
}))
