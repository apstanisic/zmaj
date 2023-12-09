import { useIsAllowedSystem } from "@admin-panel/hooks/use-is-allowed"
import { FormPasswordInput } from "@admin-panel/ui/Controlled"
import { Button } from "@admin-panel/ui/buttons/Button"
import { zodResolver } from "@hookform/resolvers/zod"
import { UserUpdatePasswordDto } from "@zmaj-js/common"
import { Form, useNotify, useRedirect } from "ra-core"
import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useSdk } from "../../context/sdk-context"

const schema = z.object({
	oldPassword: z.string().min(4),
	newPassword: z.string().min(8),
	confirmPassword: z.string().min(8),
})
/**
 *  Change password form
 */
export function ChangePassword() {
	const sdk = useSdk()
	const notify = useNotify()
	const redirect = useRedirect()
	const canChange = useIsAllowedSystem("account", "updatePassword")

	const onSubmit = useCallback(
		async (data: z.infer<typeof schema>) => {
			if (data.newPassword !== data.confirmPassword) {
				return notify("New passwords do not match", { type: "error" })
			}
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

	const { control, handleSubmit } = useForm({
		defaultValues: { oldPassword: "", newPassword: "", confirmPassword: "" },
		resolver: zodResolver(schema),
	})

	return (
		<Form onSubmit={handleSubmit(onSubmit) as any}>
			<FormPasswordInput
				control={control}
				label="Current password"
				isRequired
				name="oldPassword"
			/>
			<FormPasswordInput
				control={control}
				label="New password"
				isRequired
				name="newPassword"
			/>
			<FormPasswordInput
				control={control}
				label="Confirm password"
				isRequired
				name="confirmPassword"
			/>

			<div className="flex justify-end">
				<Button
					className="ml-auto mt-2"
					type="submit"
					variant="outlined"
					isDisabled={!canChange}
				>
					Change Password
				</Button>
			</div>
		</Form>
	)
}
