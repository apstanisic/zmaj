import { MyReferenceInput } from "@admin-panel/generator/many-to-one/MyReferenceInput"
import { useHtmlTitle } from "@admin-panel/hooks/use-html-title"
import { ChoicesDialogAndButton } from "@admin-panel/shared/choices/ChoicesDialogAndButton"
import { useInputField } from "@admin-panel/shared/input/useInputField"
import { Button } from "@admin-panel/ui/Button"
import { Card } from "@admin-panel/ui/Card"
import { CircularProgress } from "@admin-panel/ui/CircularProgress"
import { useQuery } from "@tanstack/react-query"
import { ADMIN_ROLE_ID, ChangeSettingsDto } from "@zmaj-js/common"
import { CustomRoutes, Form, useNotify } from "ra-core"
import { memo, useCallback } from "react"
import { Route } from "react-router"
import { usePublicInfo } from "../../auth/hooks/use-public-info"
import { useSdk } from "../../context/sdk-context"
import { BooleanInputField } from "../../field-components/boolean/BooleanInputField"
import { ManualInputField } from "../../shared/input/ManualInputField"

export function settingsPage(): JSX.Element {
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
					<ManualInputField
						Component={BooleanInputField}
						isRequired
						source="signUpAllowed"
						label="Sign Up Allowed"
						disabled={!settings.data.meta.signUpDynamic}
					/>
					<DefaultRoleInput />
					<Button type="submit">Change</Button>
				</Form>
				<br />
			</div>
		</Card>
	)
})

function DefaultRoleInput(): JSX.Element {
	const field = useInputField({
		source: "defaultSignUpRole",
	})
	return (
		<MyReferenceInput
			reference="zmajRoles"
			source="defaultSignUpRole"
			// you can't set admin as default role. This is big footgun
			filter={{ id: { $ne: ADMIN_ROLE_ID } }}
		>
			<ChoicesDialogAndButton template="{name}" field={field} />
		</MyReferenceInput>
	)
}
