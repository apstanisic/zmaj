import { SizeVariant } from "@admin-panel/ui/StyleVariant"
import { cn } from "@admin-panel/utils/cn"
import { notNil } from "@zmaj-js/common"
import { ReactNode } from "react"
import { Tab, TabList, TabPanel, TabPanelProps } from "react-aria-components"

const sizeCss: Record<SizeVariant, string> = {
	large: cn("du-tab-lg"),
	medium: cn("du-tab-md"),
	small: cn("du-tab-sm"),
}

export function TabHeaderItems(props: {
	items: ({ id: string; text: ReactNode } | null)[]
	size?: SizeVariant
}) {
	const { items, size = "medium" } = props
	return (
		<TabList>
			{items.filter(notNil).map((item) => (
				<Tab
					id={item.id}
					key={item.id}
					className={({ isSelected, isFocusVisible }) =>
						cn(
							"du-tab du-tab-bordered rounded-t-md focus-visible:outline-none",
							sizeCss[size],
							isFocusVisible && " bg-base-200",
							isSelected ? "du-tab-active" : "border-b-transparent",
						)
					}
				>
					{item.text}
				</Tab>
			))}
		</TabList>
	)
}

export function TabsSection(props: TabPanelProps) {
	return <TabPanel {...props} className={cn("w-full grid", props.className)} />
}
