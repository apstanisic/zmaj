import { Button } from "@admin-panel/ui/Button"
import { SignUpDto, Struct, throwErr } from "@zmaj-js/common"
import { Form, useLogin, useNotify, useRedirect } from "ra-core"
import { useCallback } from "react"
import { useSdk } from "../../context/sdk-context"
import { EmailInputField } from "../../field-components/email/EmailInputField"
import { PasswordInputField } from "../../field-components/password/PasswordInputField"
import { ManualInputField } from "../../shared/input/ManualInputField"
import { usePublicInfo } from "../hooks/use-public-info"

/**
 * We can use same form for create admin and create normal account since it's same data
 */
export function SignUpForm(props: {
	type?: "sign-up" | "init-admin" | "invitation"
	defaultData?: Partial<SignUpDto>
	invitationToken?: string
}): JSX.Element {
	const sdk = useSdk()
	const notify = useNotify()
	const redirect = useRedirect()
	const login = useLogin()
	const info = usePublicInfo()

	const signIn = useCallback(
		async (email: string, password: string) => {
			try {
				await login({ email, password })
			} catch (error) {
				notify("Account created, but sign in unsuccessful", { type: "error" })
				redirect("/login")
			}
		},
		[login, notify, redirect],
	)

	const onSubmit = useCallback(
		async (data: Struct) => {
			const parsed = SignUpDto.fromUnknown(data)

			try {
				// init admin
				if (props.type === "init-admin") {
					await sdk.auth.createFirstAdminAccount(parsed)
					await signIn(parsed.email, parsed.password)
					// await info.refetch().catch(() => {})
					return
				} else if (props.type === "invitation") {
					// await sdk.auth.acceptInvitation(parsed)
					if (!props.invitationToken) throwErr()
					await sdk.auth.acceptInvitation({ ...parsed, token: props.invitationToken })
					await signIn(parsed.email, parsed.password)
					return
				}

				// regular sign up
				await sdk.auth.signUp(parsed)

				if (info.data?.requireEmailConfirmation !== false) {
					notify("Sign up successful. Please confirm email before signing in", {
						type: "success",
					})
					redirect("/login")
				} else {
					await signIn(parsed.email, parsed.password)
				}
			} catch (error) {
				return notify("Problem creating account", { type: "error" })
			}
		},
		[
			info.data?.requireEmailConfirmation,
			notify,
			props.invitationToken,
			props.type,
			redirect,
			sdk.auth,
			signIn,
		],
	)

	return (
		<Form className="grid w-full" onSubmit={onSubmit} defaultValues={props.defaultData}>
			<ManualInputField source="firstName" />
			<ManualInputField source="lastName" />
			<ManualInputField
				source="email"
				isRequired
				Component={EmailInputField}
				disabled={props.type === "invitation"}
			/>
			<ManualInputField source="password" isRequired Component={PasswordInputField} />

			<Button type="submit" outline className="ml-auto">
				Sign Up
			</Button>
		</Form>
	)
}
