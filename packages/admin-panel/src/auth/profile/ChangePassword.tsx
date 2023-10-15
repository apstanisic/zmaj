import { useIsAllowedSystem } from "@admin-panel/hooks/use-is-allowed"
import { Button } from "@admin-panel/ui/buttons/Button"
import { Struct, UserUpdatePasswordDto } from "@zmaj-js/common"
import { Form, useNotify, useRedirect } from "ra-core"
import { useCallback } from "react"
import { useWatch } from "react-hook-form"
import { useSdk } from "../../context/sdk-context"
import { PasswordInputField } from "../../field-components/password/PasswordInputField"
import { ManualInputField } from "../../shared/input/ManualInputField"

// type Values = ChangePasswordDto & { confirmPassword: string }
/**
 *  Change password form
 */
export function ChangePassword(): JSX.Element {
	const sdk = useSdk()
	const notify = useNotify()
	const redirect = useRedirect()
	const canChange = useIsAllowedSystem("account", "updatePassword")

	const onSubmit = useCallback(
		async (data: Struct) => {
			await sdk.auth.profile
				.changePassword(UserUpdatePasswordDto.fromUnknown(data))
				.then((res) => {
					notify("Password successfully updated", { type: "success" })
					redirect("/profile")
				})
				.catch((e) => notify("Problem changing password", { type: "error" }))
		},
		[notify, redirect, sdk.auth.profile],
	)

	return (
		<Form onSubmit={onSubmit}>
			<ManualInputField Component={PasswordInputField} isRequired source="oldPassword" />
			<ManualInputField Component={PasswordInputField} isRequired source="newPassword" />
			<ConfirmPassword />

			<div className="flex justify-end">
				<Button
					className="ml-auto mt-2"
					type="submit"
					variant="outline"
					isDisabled={!canChange}
				>
					Change Password
				</Button>
			</div>
		</Form>
	)
}

/** Need to be separate function to access form context */
function ConfirmPassword(): JSX.Element {
	const newPassword = useWatch({ name: "newPassword" })

	return (
		<ManualInputField
			Component={PasswordInputField}
			isRequired
			source="confirmPassword"
			validate={[(val) => (val !== newPassword ? "Not same" : undefined)]}
		/>
	)
}
