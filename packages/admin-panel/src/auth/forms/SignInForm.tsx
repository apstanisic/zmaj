import { useSdk } from "@admin-panel/context/sdk-context"
import { FormEmailInput, FormPasswordInput } from "@admin-panel/ui/Controlled"
import { Dialog } from "@admin-panel/ui/Dialog"
import { Button } from "@admin-panel/ui/buttons/Button"
import { TextInput } from "@admin-panel/ui/forms/TextInput"
import { SdkError } from "@zmaj-js/client-sdk"
import { EnableMfaParams, SignInDto, Struct } from "@zmaj-js/common"
import { Form, useLogin, useNotify } from "ra-core"
import { useCallback, useState } from "react"
import { DisplayMfaQrCode } from "../components/DisplayMfaQrCode"

export function SignInForm(): JSX.Element {
	const login = useLogin()
	const notify = useNotify()
	const sdk = useSdk()
	const [emailAndPass, setEmailAndPass] = useState<SignInDto>()
	const [mfa, setMfa] = useState("")
	const [createMfaParams, setCreateMfaParams] = useState<EnableMfaParams>()
	const [prompt, setPrompt] = useState<"has-mfa" | "must-create-mfa">()

	const onSubmit = useCallback(
		async (data: Struct) => {
			const dto = SignInDto.fromUnknown(data)
			const result = await sdk.auth.signIn(dto).catch((e: SdkError) => {
				notify(e.message, { type: "error" })
			})
			if (!result) return
			if (result.status === "has-mfa") {
				setPrompt("has-mfa")
				setEmailAndPass(dto)
			} else if (result.status === "must-create-mfa") {
				setPrompt("must-create-mfa")
				setEmailAndPass(dto)
				setCreateMfaParams(result.data)
			} else if (result.status === "signed-in") {
				await login(undefined).catch((e) =>
					notify(e.message ?? "Problem signing in", { type: "error" }),
				)
			}
		},
		[login, notify, sdk.auth],
	)

	const mfaSubmit = useCallback(async () => {
		await login({ ...emailAndPass, otpToken: mfa } as SignInDto).catch((e) =>
			notify(e.message ?? "Problem signing in", { type: "error" }),
		)
	}, [emailAndPass, login, mfa, notify])

	return (
		<>
			<Dialog
				onClose={() => {
					setEmailAndPass(undefined)
					setMfa("")
					setPrompt(undefined)
				}}
				open={prompt === "has-mfa"}
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
				<Button variant="outlined" isDisabled={mfa.length < 6} onPress={mfaSubmit}>
					Confirm
				</Button>
			</Dialog>
			<Dialog
				onClose={() => {
					setCreateMfaParams(undefined)
					setEmailAndPass(undefined)
				}}
				open={prompt === "must-create-mfa"}
				noStyle
			>
				{createMfaParams && (
					<DisplayMfaQrCode
						{...createMfaParams!}
						onConfirm={() => {
							onSubmit(
								new SignInDto({
									...emailAndPass!,
									otpToken: createMfaParams.backupCodes[0],
								}),
							)
							setCreateMfaParams(undefined)
						}}
						title="You must first enable multi-factor auth"
						expiredDialog={
							<div className="bg-warning p-4 rounded-md text-warning-content">
								Time expired, please sign in again
							</div>
						}
						refreshCode={async () => {}}
					/>
				)}
			</Dialog>
			<Form
				className="grid w-full gap-y-1"
				onSubmit={onSubmit}
				defaultValues={{ email: "", password: "" }}
			>
				<FormEmailInput label="Email" name="email" isRequired />
				<FormPasswordInput label="Password" name="password" isRequired />

				<Button type="submit" variant="outlined" className="ml-auto">
					Sign in
				</Button>
			</Form>
		</>
	)
}
