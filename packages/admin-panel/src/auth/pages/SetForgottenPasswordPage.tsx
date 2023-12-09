import { useSdk } from "@admin-panel/context/sdk-context"
import { useHtmlTitle } from "@admin-panel/hooks/use-html-title"
import { Button } from "@admin-panel/ui/buttons/Button"
import { FormPasswordInput } from "@admin-panel/ui/Controlled"
import { PasswordResetDto, PasswordSchema, sleep, Struct } from "@zmaj-js/common"
import { Form, useNotify, useRedirect } from "ra-core"
import { useCallback } from "react"
import { useSearchParams } from "react-router-dom"
import { AuthPageLayout } from "../components/AuthPageLayout"
import { useRedirectAuthenticated } from "../hooks/use-redirect-authenticated"

export function SetForgottenPasswordPage() {
	useHtmlTitle("Set forgotten password")
	const notify = useNotify()
	const signedIn = useRedirectAuthenticated()
	const redirect = useRedirect()
	const [query] = useSearchParams()
	const sdk = useSdk()

	const onSubmit = useCallback(
		async (data: Struct) => {
			const token = query.get("token")

			if (!token || token.length < 10) return notify("Corrupted link", { type: "error" })

			const validPass = PasswordSchema.safeParse(data["password"])
			if (!validPass.success) return notify("Invalid password", { type: "error" })

			const dto = new PasswordResetDto({
				token,
				password: validPass.data,
			})

			await sdk.auth
				.changeForgottenPassword(dto)
				.catch(() => notify("Problem setting new password", { type: "error" }))
			redirect("/login")
			await sleep(200)
			notify("Password successfully changed", { type: "success" })
		},
		[notify, query, redirect, sdk.auth],
	)

	if (signedIn) return <></>
	return (
		<AuthPageLayout>
			<h1 className="mt-2 mb-1 text-xl dark:text-white">Password Reset</h1>
			<h2>Enter your new password</h2>
			<Form
				onSubmit={onSubmit}
				defaultValues={{ password: "" }}
				className="grid w-full gap-y-1"
			>
				<FormPasswordInput name="password" isRequired label="Password" />

				<Button type="submit" variant="outlined" className="ml-auto">
					Change Password
				</Button>
			</Form>
		</AuthPageLayout>
	)
}
