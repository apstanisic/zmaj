import { AnyMongoAbility, createAliasResolver, defineAbility } from "@casl/ability"
import { DefinedUseQueryResult, useQuery } from "@tanstack/react-query"
import { AllowedAction, isNil } from "@zmaj-js/common"
import { minutesToMilliseconds } from "date-fns"
import { memo } from "radash"
import { useSdk } from "../context/sdk-context"

const manageAll = defineAbility((can) => can("manage", "all"))

const resolveAction = createAliasResolver({
	modify: ["update", "delete", "create"],
	read: ["show", "list"],
	update: ["edit"],
})

export type Authz = AnyMongoAbility

/**
 * For some reason, select is called on changing page, even when using stable function identity,
 * so I simply memoized result. I haven't found better simple way.
 * It's possible on success, but then we have to have method when reloading page.
 * Main problem is persistance, which removes casl methods
 */
const buildAuthz = memo((data: AllowedAction[] | null) => {
	if (isNil(data)) return manageAll
	return defineAbility(
		(can) => {
			for (const action of data) {
				can(action.action, action.resource, action.fields?.concat() ?? undefined, {})
			}
		},
		{ resolveAction },
	)
})

function useAuthzState(): DefinedUseQueryResult<AnyMongoAbility> {
	const sdk = useSdk()

	return useQuery({
		queryKey: ["zmaj", "authz"],
		queryFn: async () => sdk.authz.allowedActions().catch(() => null),
		staleTime: minutesToMilliseconds(5),
		select: buildAuthz,
		placeholderData: null,
		initialData: undefined as any as AllowedAction[] | null,
	})
}

export function useAuthz(): AnyMongoAbility {
	return useAuthzState().data
}
