import { ReactNode } from "react"
import { Link } from "react-router-dom"
import { useVisitManyToOneHref } from "./useVisitManyToOneHref"

type ManyToOneLinkProps = {
	children: ReactNode
	newTab?: boolean
}

export function ManyToOneLink(props: ManyToOneLinkProps): JSX.Element {
	const { children, newTab = false } = props
	// this is record from relation

	const href = useVisitManyToOneHref()
	if (!href) return <>{props.children}</>

	return (
		<Link
			className="du-link-primary"
			to={href}
			target={newTab ? "_blank" : undefined}
			rel={newTab ? "noopener noreferrer" : undefined}
		>
			{children}
		</Link>
	)
}
