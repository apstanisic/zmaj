import { useSdk } from "@admin-panel/context/sdk-context"
import { useHtmlTitle } from "@admin-panel/hooks/use-html-title"
import { Button } from "@admin-panel/ui/buttons/Button"
import { FormEmailInput } from "@admin-panel/ui/Controlled"
import { isEmail, Struct } from "@zmaj-js/common"
import { Form, useNotify } from "ra-core"
import { useCallback, useState } from "react"
import { Link } from "react-router-dom"
import { AuthPageLayout } from "../components/AuthPageLayout"
import { useRedirectAuthenticated } from "../hooks/use-redirect-authenticated"

export function RequestPasswordResetPage(): JSX.Element {
	useHtmlTitle("Forgotten password")
	const notify = useNotify()
	const signedIn = useRedirectAuthenticated()
	const sdk = useSdk()
	// this is very ugly, bit simplest way currently to clean form
	// we simply force rerender of the form on submit, because key is changed
	const [formKey, setFormKey] = useState(0)
	const [disabled, setDisabled] = useState(false)

	const onSubmit = useCallback(
		async (data: Struct) => {
			const email = data["email"]
			if (!isEmail(email)) {
				return notify("Invalid Email", { type: "error" })
			}

			setFormKey((k) => k + 1)
			setDisabled(true)
			sdk.auth
				.sendPasswordResetEmail(email)
				.then(() =>
					notify("Password reset email sent. Please check you email", {
						type: "success",
					}),
				)
				.catch(() => notify("Problem sending password reset email.", { type: "error" }))
				.finally(() => setDisabled(false))
		},
		[notify, sdk.auth],
	)

	if (signedIn) return <></>
	return (
		<AuthPageLayout>
			<h1 className="mt-2 mb-1 text-xl dark:text-white">Password Reset</h1>
			<h2>Please Enter your email</h2>
			<Form
				key={formKey}
				onSubmit={onSubmit}
				context
				defaultValues={{ email: "" }}
				className="grid w-full gap-y-1"
			>
				<FormEmailInput name="email" isRequired placeholder="Your email" />

				<Button className="mt-4" type="submit" isDisabled={disabled}>
					Send password reset email
				</Button>
				<Link to={"/login"} className="ml-autok du-link mt-5">
					Return to login page
				</Link>
			</Form>
		</AuthPageLayout>
	)
}
