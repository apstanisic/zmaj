import { useSdk } from "@admin-panel/context/sdk-context"
import { useHtmlTitle } from "@admin-panel/hooks/use-html-title"
import { FormPasswordInput } from "@admin-panel/ui/Controlled"
import { Button } from "@admin-panel/ui/buttons/Button"
import { OtpDisableDto, Struct } from "@zmaj-js/common"
import { Form, useNotify, useRedirect } from "ra-core"
import { memo, useCallback, useState } from "react"
import { DisplayMfaQrCode } from "../components/DisplayMfaQrCode"
import { useHasMfa } from "./useUserProfile"

export function Enable2FA() {
	const sdk = useSdk()
	useHtmlTitle("Enable 2FA")
	const redirect = useRedirect()
	const [otp, setOtp] = useState<{
		secret: string
		image: string
		jwt: string
		backupCodes: string[]
	}>()
	const hasOtp = useHasMfa().data

	const enable = useCallback(async () => {
		const data = await sdk.auth.mfa.requestToEnableOtp()
		setOtp(data)
	}, [sdk.auth.mfa])

	if (hasOtp) {
		return <Disable2FA />
	}

	return (
		<div className="center mt-8">
			{otp ? (
				<DisplayMfaQrCode
					refreshCode={enable}
					{...otp}
					onConfirm={() => redirect("/profile")}
				/>
			) : (
				<Button onPress={enable}>Enable 2FA</Button>
			)}
		</div>
	)
}

const Disable2FA = memo(() => {
	const sdk = useSdk()
	const notify = useNotify()
	const redirect = useRedirect()
	// const canChange = useIsAllowedSystem("account", "updateEmail")

	const onSubmit = useCallback(
		async (data: Struct) => {
			await sdk.auth.mfa
				.disableOtp(OtpDisableDto.fromUnknown(data))
				.then(() => {
					notify("2FA disabled", { type: "success" })
					redirect("/profile")
				})
				.catch(() => notify("Problem disabling 2FA", { type: "error" }))
		},
		[notify, redirect, sdk.auth.mfa],
	)

	return (
		<Form defaultValues={{ password: "" }} onSubmit={onSubmit}>
			<p className="mb-6 mt-3 text-center text-xl">Disable 2FA</p>
			<FormPasswordInput name="password" isRequired />

			<div className="flex justify-end">
				<Button className="ml-auto mt-2" type="submit" variant="outlined">
					Disable 2FA
				</Button>
			</div>
		</Form>
	)
})
