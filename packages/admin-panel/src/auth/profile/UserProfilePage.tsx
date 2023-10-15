import { useHtmlTitle } from "@admin-panel/hooks/use-html-title"
import { useIsAllowedSystem, useRedirectForbidden } from "@admin-panel/hooks/use-is-allowed"
import { CircularProgress } from "@admin-panel/ui/CircularProgress"
import { Tooltip } from "@admin-panel/ui/Tooltip"
import { IconButton } from "@admin-panel/ui/buttons/IconButton"
import { getCrudUrl } from "@admin-panel/utils/get-crud-url"
import { AuthSessionCollection } from "@zmaj-js/common"
import { MdDevices, MdEdit, MdLock, MdLockOpen } from "react-icons/md"
import { useHref } from "react-router"
import { LayoutSection } from "../../crud-layouts/ui/LayoutSection"
// import { Link } from "react-router"
import { ShowFieldContainer } from "@admin-panel/shared/show/ShowFieldContainer"
import { useHasMfa, useUserProfile } from "./useUserProfile"

export function UserProfilePage(): JSX.Element {
	useHtmlTitle("Profile")
	const user = useUserProfile().data
	const seeSessionsHref = useHref({ pathname: getCrudUrl(AuthSessionCollection, "list") })
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
					<IconButton
						size="large"
						aria-label={hasMfa ? "Disable 2FA" : "Enable 2FA"}
						href={enable2faHref}
					>
						{hasMfa ? <MdLock /> : <MdLockOpen />}
					</IconButton>
				</Tooltip>

				{canReadSessions && (
					<Tooltip text="Signed In Devices">
						<IconButton
							size="large"
							aria-label="Signed in devices"
							href={seeSessionsHref}
						>
							<MdDevices />
						</IconButton>
					</Tooltip>
				)}

				<Tooltip text="Edit Profile">
					<IconButton size="large" aria-label="Edit profile" href={editProfileHref}>
						<MdEdit />
					</IconButton>
				</Tooltip>
			</div>
			<ShowFieldContainer label="Email">{user.email}</ShowFieldContainer>
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
				<ShowFieldContainer label="First Name">{user.firstName}</ShowFieldContainer>
				<ShowFieldContainer label="Last Name">{user.lastName}</ShowFieldContainer>
			</div>
		</LayoutSection>
	)
}
