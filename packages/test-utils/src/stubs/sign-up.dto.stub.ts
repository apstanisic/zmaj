import { randBoolean, randEmail, randFirstName, randLastName, randPassword } from "@ngneat/falso"
import { SignUpDto, stub } from "@zmaj-js/common"

export const SignUpDtoStub = stub<SignUpDto>(
	() =>
		new SignUpDto({
			email: randEmail(),
			password: randPassword(),
			firstName: randBoolean() ? undefined : randFirstName(),
			lastName: randBoolean() ? undefined : randLastName(),
		}),
)
