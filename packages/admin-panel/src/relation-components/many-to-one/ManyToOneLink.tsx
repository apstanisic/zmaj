import { ReactNode } from "react"
import { Link } from "react-router-dom"
import { useVisitManyToOneHref } from "./useVisitManyToOneHref"

export function ManyToOneLink(props: { children: ReactNode }): JSX.Element {
	// this is record from relation

	const href = useVisitManyToOneHref()
	if (!href) return <>{props.children}</>

	return (
		<Link className="du-link-primary" to={href}>
			{props.children}
		</Link>
	)
}
