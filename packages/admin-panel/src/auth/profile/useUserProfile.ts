import { useQuery, UseQueryResult } from "@tanstack/react-query"
import { ProfileInfo } from "@zmaj-js/common"
import { useSdk } from "../../context/sdk-context"

export function useUserProfile(): UseQueryResult<ProfileInfo> {
	const sdk = useSdk()

	return useQuery({
		queryKey: ["zmaj", "profile"],
		queryFn: async () => sdk.auth.profile.getUserInfo(),
	})
}

export function useHasMfa(): UseQueryResult<boolean> {
	const sdk = useSdk()

	return useQuery({
		queryKey: ["zmaj", "has-mfa"],
		queryFn: async () => sdk.auth.mfa.hasMfa(),
		placeholderData: false,
	})
}
