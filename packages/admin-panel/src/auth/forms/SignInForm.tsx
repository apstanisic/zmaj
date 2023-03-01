import { useSdk } from "@admin-panel/context/sdk-context"
import { Button } from "@admin-panel/ui/Button"
import { Dialog } from "@admin-panel/ui/Dialog"
import { TextInput } from "@admin-panel/ui/TextInput"
import { SignInDto, Struct } from "@zmaj-js/common"
import { Form, useLogin, useNotify } from "ra-core"
import { useCallback, useState } from "react"
import { EmailInputField } from "../../field-components/email/EmailInputField"
import { PasswordInputField } from "../../field-components/password/PasswordInputField"
import { ManualInputField } from "../../shared/input/ManualInputField"

export function SignInForm(): JSX.Element {
	const login = useLogin()
	const notify = useNotify()
	const sdk = useSdk()
	const [emailAndPass, setEmailAndPass] = useState<SignInDto>()
	const [mfa, setMfa] = useState("")

	const onSubmit = useCallback(
		async (data: Struct) => {
			const dto = SignInDto.fromUnknown(data)
			const hasMfa = await sdk.auth.mfa.hasMfa(dto)
			if (!hasMfa) {
				await login(data).catch(() => notify("Problem signing in", { type: "error" }))
			} else {
				setEmailAndPass(dto)
			}
		},
		[login, notify, sdk.auth],
	)

	const mfaSubmit = useCallback(async () => {
		await login({ ...emailAndPass, otpToken: mfa } as SignInDto).catch(() =>
			notify("Problem signing in", { type: "error" }),
		)
	}, [emailAndPass, login, mfa, notify])

	return (
		<>
			<Dialog
				onClose={() => {
					setEmailAndPass(undefined)
					setMfa("")
				}}
				open={emailAndPass !== undefined}
				className="max-w-md p-6"
			>
				<p className="text-lg">Please open your 2FA app and enter code</p>
				<TextInput
					className="my-5"
					placeholder="123456 or backup code"
					aria-label="2FA code or backup code"
					onChange={setMfa}
					value={mfa ?? ""}
				/>
				<Button outline disabled={mfa.length < 6} onClick={mfaSubmit}>
					Confirm
				</Button>
			</Dialog>
			<Form
				className="grid w-full gap-y-1"
				onSubmit={onSubmit}
				defaultValues={{ email: "", password: "" }}
			>
				<ManualInputField source="email" isRequired Component={EmailInputField} />
				<ManualInputField source="password" isRequired Component={PasswordInputField} />

				<Button type="submit" outline className="ml-auto">
					Sign in
				</Button>
			</Form>
		</>
	)
}
