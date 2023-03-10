import { Tab } from "@headlessui/react"
import { clsx } from "clsx"
import { memo, PropsWithChildren, ReactNode } from "react"

export const TabsLayout = memo(
	(
		props: PropsWithChildren<{
			sections: (string | ReactNode)[]
			className?: string
			border?: boolean
			size?: "small" | "medium"
		}>,
	) => {
		return (
			<div className={clsx(props.border && "rounded-lg border")}>
				<Tab.Group manual>
					<Tab.List className={clsx("du-tabs ", "flex w-full justify-center")}>
						{props.sections.map((section, i) => (
							<Tab
								key={i}
								className={({ selected }) =>
									clsx(
										"du-tab du-tab-bordered",
										selected ? "du-tab-bordered du-tab-active" : "border-b-transparent",
										props.size === "small" ? "du-tab-md" : "du-tab-lg",
									)
								}
							>
								{section}
							</Tab>
						))}
					</Tab.List>
					<Tab.Panels>{props.children}</Tab.Panels>
				</Tab.Group>
			</div>
		)
	},
)
