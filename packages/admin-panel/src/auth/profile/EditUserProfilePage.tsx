import { useHtmlTitle } from "@admin-panel/hooks/use-html-title"
import { useIsAllowedSystem } from "@admin-panel/hooks/use-is-allowed"
import { Card } from "@admin-panel/ui/Card"
import { ChangeEmail } from "./ChangeEmail"
import { ChangePassword } from "./ChangePassword"
import { ChangeUserInfo } from "./ChangeUserInfo"
import { useUserProfile } from "./useUserProfile"

export function UserProfileEdit(): JSX.Element {
	useHtmlTitle("Edit profile")
	const query = useUserProfile()

	const changePassword = useIsAllowedSystem("account", "updatePassword")
	const changeEmail = useIsAllowedSystem("account", "updateEmail")
	const changeProfile = useIsAllowedSystem("account", "updateProfile")

	if (!query.data) <></>

	return (
		<div className="mx-auto grid max-w-2xl grid-cols-1 gap-4">
			<h1 className="mx-auto mt-4 text-2xl">Edit Profile</h1>
			<Card className="p-4">
				<h2 className="text-center   text-xl">
					Info
					{!changeProfile && <span className="ml-3 text-sm text-warning">(Forbidden)</span>}
				</h2>
				<ChangeUserInfo />
			</Card>

			<Card className="mt-6 p-4">
				<h2 className="text-center text-xl">
					Email
					{!changeEmail && <span className="ml-3 text-sm text-warning">(Forbidden)</span>}
				</h2>
				<ChangeEmail />
			</Card>

			<Card className="mt-6 p-4">
				<h2 className="text-center text-xl">
					Password
					{!changePassword && <span className="ml-3 text-sm text-warning">(Forbidden)</span>}
				</h2>
				<ChangePassword />
			</Card>
		</div>
	)
}
