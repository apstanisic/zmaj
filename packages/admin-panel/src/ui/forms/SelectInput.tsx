import { cn } from "@admin-panel/utils/cn"
import { isEmpty } from "radash"
import { useContext, useMemo } from "react"
import {
	Button,
	Item,
	ListBox,
	Popover,
	Select,
	SelectProps,
	SelectStateContext,
	SelectValue,
} from "react-aria-components"
import { MdCheck, MdClose, MdExpandMore } from "react-icons/md"
import { useMeasure } from "react-use"
import { Except } from "type-fest"
import { IconButton } from "../buttons/IconButton"
import { FormControl } from "./FormControl"
import { borderCss, getInputBoxCss } from "./forms-css"

type ItemOption = { value: string | number; label?: string; disabled?: boolean }

export type SelectInputProps = Except<
	SelectProps<ItemOption>,
	"children" | "selectedKey" | "onSelectionChange" | "defaultSelectedKey"
> & {
	label?: string
	description?: string
	error?: string
	placeholder?: string
	//
	triggerClassName?: string
	options: ItemOption[]
	value?: SelectProps<ItemOption>["selectedKey"]
	defaultValue?: SelectProps<ItemOption>["defaultSelectedKey"]
	onChange?: (value: string | number | null) => unknown
}

export function SelectInput(props: SelectInputProps): JSX.Element {
	const {
		value,
		onChange,
		defaultValue,
		options = [],
		label,
		description,
		error,
		placeholder,
		triggerClassName,
		...raProps
	} = props
	const [buttonSizeRef, measure] = useMeasure<HTMLButtonElement>()

	const disabledItems = useMemo(
		() => options.filter((op) => op.disabled).map((op) => op.value),
		[options],
	)

	return (
		<Select
			{...raProps}
			defaultSelectedKey={defaultValue}
			selectedKey={value}
			onSelectionChange={onChange as SelectProps<any>["onSelectionChange"]}
			disabledKeys={disabledItems}
			className={cn("w-full my-1", raProps.className)}
			aria-label={label}
		>
			<FormControl
				description={description}
				error={error}
				isRequired={raProps.isRequired}
				label={label}
			>
				<div className="w-full relative">
					<Button
						className={cn(
							getInputBoxCss(props),
							"items-stretch justify-between",
							triggerClassName,
						)}
						ref={buttonSizeRef}
					>
						<SelectValue
							placeholder={"test me"}
							className={({ isPlaceholder }) =>
								cn("flex items-center ml-1", isPlaceholder && "ml-4 text-gray-400")
							}
						/>
						<div aria-hidden="true" className="ml-auto center mr-2">
							<MdExpandMore />
						</div>
					</Button>
					{!raProps.isRequired && <ClearButton />}
				</div>
			</FormControl>
			{/* Button has 2px border. -10 is to remove gap */}
			<Popover style={{ width: measure.width + 4, marginTop: -10 }}>
				<ListBox className={cn("bg-base-100 w-full", borderCss)}>
					{options.map((item) => (
						<Item
							key={item.value}
							id={item.value}
							className="outline-none"
							textValue={item.label ?? item.value.toString()}
						>
							{({ isSelected, isPressed, isHovered }) => (
								<div
									className={cn(
										"py-2 px-3 w-full flex justify-between items-center",
										isSelected && "font-bold",
										isHovered && "bg-base-200",
										isPressed && "bg-base-300",
										item.disabled ? "text-base-content/60" : "cursor-pointer",
									)}
								>
									{item.label ?? item.value}
									{isSelected && <MdCheck />}
								</div>
							)}
						</Item>
					))}
				</ListBox>
			</Popover>
		</Select>
	)
}

function ClearButton(): JSX.Element {
	const { selectedKey, setSelectedKey } = useContext(SelectStateContext)
	if (isEmpty(selectedKey)) return <></>
	return (
		<div className={"absolute top-0 bottom-0 right-10  center"}>
			<IconButton
				aria-label="Clear value"
				// This is from their docs
				// Don't inherit behavior from Select.
				slot={null}
				size="small"
				onPress={() => setSelectedKey(null)}
			>
				<MdClose />
			</IconButton>
		</div>
	)
}
