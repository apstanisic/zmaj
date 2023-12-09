import { useHtmlTitle } from "@admin-panel/hooks/use-html-title"
import { Card } from "@admin-panel/ui/Card"
import { CircularProgress } from "@admin-panel/ui/CircularProgress"
import { FormSwitchInput } from "@admin-panel/ui/Controlled"
import { Button } from "@admin-panel/ui/buttons/Button"
import { useQuery } from "@tanstack/react-query"
import { ChangeSettingsDto } from "@zmaj-js/common"
import { CustomRoutes, Form, useNotify } from "ra-core"
import { memo, useCallback } from "react"
import { Route } from "react-router"
import { usePublicInfo } from "../../auth/hooks/use-public-info"
import { useSdk } from "../../context/sdk-context"

export function settingsPage() {
	return (
		<CustomRoutes>
			<Route path="settings" element={<Settings />} />
		</CustomRoutes>
	)

	//
}

const Settings = memo(() => {
	useHtmlTitle("Settings")
	const info = usePublicInfo()
	const sdk = useSdk()
	const notify = useNotify()
	const settings = useQuery({
		queryKey: ["zmaj", "settings"], //
		queryFn: async () => sdk.system.settings.getSettings(),
	})

	const onSubmit = useCallback(
		async (data: ChangeSettingsDto) => {
			await sdk.system.settings
				.changeSettings(data)
				.then(async () => info.refetch())
				.then(() => notify("Settings changed", { type: "success" }))
				.catch(() => notify("Problem changing settings", { type: "error" }))
		},
		[sdk.system.settings, info, notify],
	)

	if (!settings.isSuccess) return <CircularProgress />

	return (
		<Card className="mx-auto max-w-5xl">
			<div className="p-3">
				<p className="my-2 border-b pb-4 text-center text-lg">Settings </p>
				{/*  { signUpAllowed: settings.data.data., defaultSignUpRole: "" } */}
				<Form defaultValues={settings.data.data} onSubmit={onSubmit as any}>
					<FormSwitchInput
						isRequired
						name="signUpAllowed"
						label="Sign Up Allowed"
						isDisabled={!settings.data.meta.signUpDynamic}
					/>
					<Button type="submit">Change</Button>
				</Form>
				<br />
			</div>
		</Card>
	)
})
