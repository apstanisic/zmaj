// const CustomContent = forwardRef(
// 	(props: TreeItemContentProps, ref: ForwardedRef<HTMLDivElement>) => {
// 		const { classes, className, label, nodeId, icon: iconProp, expansionIcon, displayIcon } = props

// 		const {
// 			disabled,
// 			expanded,
// 			selected,
// 			focused,
// 			handleExpansion,
// 			handleSelection,
// 			preventSelection,
// 		} = useTreeItem(nodeId)

// 		const icon = iconProp || expansionIcon || displayIcon

// 		return (
// 			<div
// 				className={clsx(className, classes.root, "rounded-lg py-1 hover:rounded-lg", {
// 					[classes.selected]: selected,
// 					[classes.disabled]: disabled,
// 					// Don't show background when focused and expanded, only when selected
// 					// [classes.expanded]: expanded,
// 					// [classes.focused]: focused,
// 				})}
// 				onMouseDown={(e) => preventSelection(e)}
// 				ref={ref}
// 			>
// 				{/* Icon */}
// 				<IconButton size="small" onClick={(e) => handleExpansion(e)}>
// 					{icon}
// 				</IconButton>

// 				{/* Text */}
// 				<Typography
// 					// eslint-disable-next-line @typescript-eslint/no-explicit-any
// 					onClick={(e: any) => handleSelection(e)}
// 					component="div"
// 					className={clsx(classes.label, "pl-1 text-lg text-gray-700")}
// 				>
// 					{label}
// 				</Typography>
// 			</div>
// 		)
// 	},
// )

// /**
//  * Replaces default `TreeItem`
//  *
//  * Biggest change is that now on icon press, it will only expend, and on text press will
//  * open that folder
//  * Mostly based on with small UI tweaks
//  * @see https://mui.com/components/tree-view/#contentcomponent-prop
//  */
// export const FolderTreeItem = (
// 	props: Pick<TreeItemProps, "nodeId" | "label" | "children">,
// ): JSX.Element => <TreeItem ContentComponent={CustomContent as any} {...props} />

export default {}
