import { useIsAllowedSystem, useRedirectForbidden } from "@admin-panel/hooks/use-is-allowed"
import { CircularProgress } from "@admin-panel/ui/CircularProgress"
import { IconButton } from "@admin-panel/ui/IconButton"
import { Tooltip } from "@admin-panel/ui/Tooltip"
import { MdDevices, MdEdit, MdLock, MdLockOpen } from "react-icons/md"
import { useHref } from "react-router"
import { LayoutSection } from "../../crud-layouts/ui/LayoutSection"
// import { Link } from "react-router"
import { DefaultShowField } from "../../shared/show/DefaultShowField"
import { useHasMfa, useUserProfile } from "./useUserProfile"

export function UserProfilePage(): JSX.Element {
	const user = useUserProfile().data
	const seeSessionsHref = useHref({ pathname: "/zmaj_auth_sessions" })
	const editProfileHref = useHref({ pathname: "/profile/edit" })
	const enable2faHref = useHref({ pathname: "/profile/2fa" })
	const canReadSessions = useIsAllowedSystem("account", "readSessions")
	const canSeeProfile = useRedirectForbidden("account", "readProfile")
	const hasMfa = useHasMfa().data

	if (!user || !canSeeProfile) {
		return (
			<div className="center my-20">
				<CircularProgress />
			</div>
		)
	}

	return (
		<LayoutSection className="crud-content -m-1" largeGap>
			<div className="flex justify-between">
				<span></span>
				<h1 className="mx-auto mt-4 text-2xl">Profile</h1>

				<Tooltip text={hasMfa ? "Disable 2FA" : "Enable 2FA"}>
					<IconButton large label={hasMfa ? "Disable 2FA" : "Enable 2FA"} href={enable2faHref}>
						{hasMfa ? <MdLock /> : <MdLockOpen />}
					</IconButton>
				</Tooltip>

				{canReadSessions && (
					<Tooltip text="Signed In Devices">
						<IconButton large label="Signed in devices" href={seeSessionsHref}>
							<MdDevices />
						</IconButton>
					</Tooltip>
				)}

				<Tooltip text="Edit Profile">
					<IconButton large label="Edit profile" href={editProfileHref}>
						<MdEdit />
					</IconButton>
				</Tooltip>
			</div>
			<DefaultShowField
				action="show"
				label="Email"
				record={user}
				source="email"
				value={user.email}
			/>
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
				<DefaultShowField
					action="show"
					label="First Name"
					record={user}
					source="firstName"
					customNilText=""
					value={user.firstName}
				/>
				<DefaultShowField
					action="show"
					label="Last Name"
					record={user}
					customNilText=""
					source="lastName"
					value={user.lastName}
				/>
			</div>
		</LayoutSection>
	)
}
