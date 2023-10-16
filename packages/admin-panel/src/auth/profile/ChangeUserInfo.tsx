import { useIsAllowedSystem } from "@admin-panel/hooks/use-is-allowed"
import { FormTextInput } from "@admin-panel/ui/Controlled"
import { Button } from "@admin-panel/ui/buttons/Button"
import { ProfileUpdateDto, UserUpdateDto } from "@zmaj-js/common"
import { Form, useNotify, useRedirect } from "ra-core"
import { pick } from "radash"
import { useCallback } from "react"
import { useSdk } from "../../context/sdk-context"
import { useUserProfile } from "./useUserProfile"

export function ChangeUserInfo(): JSX.Element {
	const sdk = useSdk()
	const notify = useNotify()
	const redirect = useRedirect()
	const profile = useUserProfile()
	const canChange = useIsAllowedSystem("account", "updateProfile")

	const onSubmit = useCallback(
		async (data: UserUpdateDto) => {
			try {
				await sdk.auth.profile.changeUserInfo(ProfileUpdateDto.fromUnknown(data))
				await profile.refetch()
				notify("Profile info updated", { type: "success" })
				redirect("/profile")
			} catch (error) {
				notify("Problem updating profile", { type: "error" })
			}
		},
		[notify, profile, redirect, sdk.auth.profile],
	)

	return (
		<Form onSubmit={onSubmit} defaultValues={pick(profile.data!, ["firstName", "lastName"])}>
			<FormTextInput name="firstName" />
			<FormTextInput name="lastName" />
			<div className="flex justify-end">
				<Button
					className="ml-auto mt-2"
					type="submit"
					variant="outlined"
					isDisabled={!canChange}
				>
					Update profile
				</Button>
			</div>
		</Form>
	)
}
