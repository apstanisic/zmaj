import { usePublicInfo } from "../hooks/use-public-info"

/**
 * Render OIDC providers
 *
 * @returns Component that renders all OpenID Connect providers
 */
export function OidcProviders() {
	const oidc = usePublicInfo().data?.oidc ?? []

	return (
		<>
			{Object.keys(oidc).length > 0 && (
				<div className="my-8 grid w-full grid-cols-1 gap-4">
					{oidc.map(({ name, url }, i) => (
						<a key={i} href={url}>
							<div
								key={i}
								className="center h-12 w-full rounded border-2 border-gray-400 bg-gray-100  text-lg"
							>
								{name}
							</div>
						</a>
					))}
				</div>
			)}
		</>
	)
}
