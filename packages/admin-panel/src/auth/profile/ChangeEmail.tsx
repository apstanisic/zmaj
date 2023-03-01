import { useIsAllowedSystem } from "@admin-panel/hooks/use-is-allowed"
import { Button } from "@admin-panel/ui/Button"
import { ChangeEmailDto, Struct } from "@zmaj-js/common"
import { Form, useNotify, useRedirect } from "ra-core"
import { useCallback } from "react"
import { useSdk } from "../../context/sdk-context"
import { EmailInputField } from "../../field-components/email/EmailInputField"
import { PasswordInputField } from "../../field-components/password/PasswordInputField"
import { ManualInputField } from "../../shared/input/ManualInputField"

export function ChangeEmail(): JSX.Element {
	const sdk = useSdk()
	const notify = useNotify()
	const redirect = useRedirect()
	const canChange = useIsAllowedSystem("account", "updateEmail")

	const onSubmit = useCallback(
		async (data: Struct) => {
			await sdk.auth.profile
				.requestEmailChange(ChangeEmailDto.fromUnknown(data))
				.then(() => {
					notify("Email changed. Please check your email to confirm new email.", {
						type: "success",
					})
					redirect("/profile")
				})
				.catch(() => notify("Problem changing email", { type: "error" }))
		},
		[notify, redirect, sdk.auth.profile],
	)

	return (
		<Form defaultValues={{ newEmail: "", password: "" }} onSubmit={onSubmit}>
			<ManualInputField source="newEmail" Component={EmailInputField} isRequired />
			<ManualInputField source="password" Component={PasswordInputField} isRequired />

			<div className="flex justify-end">
				<Button className="ml-auto mt-2" type="submit" outline isDisabled={!canChange}>
					Update email
				</Button>
			</div>
		</Form>
	)
}
