import { Link } from "react-router-dom"
import { useHtmlTitle } from "./hooks/use-html-title"
import { useUserCollections } from "./hooks/use-user-collections"

export function Dashboard() {
	const userCollections = useUserCollections()
	useHtmlTitle("Dashboard")

	return (
		<div>
			<h1 className="mt-3 mb-8 text-center text-2xl">Admin panel</h1>

			<div className="">
				{userCollections.length === 0 && (
					<div className="col-span-3 mt-12  text-center text-xl">No collections</div>
				)}
				<ul className="w-full text-lg ">
					{userCollections.map((c) => (
						<li
							key={c.collectionName}
							className="my-3 rounded-xl border bg-slate-50  py-2 dark:border-stone-700 dark:bg-stone-900"
						>
							<Link to={c.collectionName} key={c.collectionName}>
								<div className="py-3 pl-5 text-gray-800 dark:text-gray-200">
									<span>{c.label ?? c.collectionName}</span>
								</div>
							</Link>
						</li>
					))}
				</ul>
			</div>
		</div>
	)
}
