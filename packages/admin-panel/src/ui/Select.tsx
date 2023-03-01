import { autoUpdate, flip, offset, shift, useFloating } from "@floating-ui/react-dom"
import { Listbox } from "@headlessui/react"
import { isNil, notNil } from "@zmaj-js/common"
import { clsx } from "clsx"
import { RefObject, useEffect, useMemo } from "react"
import { Except } from "type-fest"
import { CustomInputProps } from "./Input"
import { InputLabel, InputWrapper } from "./InputWrapper"

type Choice<T = unknown> = { value: T; label?: string; disabled?: boolean }

type AllListboxProps = Parameters<typeof Listbox>[0]
type ListboxProps = Pick<AllListboxProps, "name" | "value" | "onChange" | "disabled">

// TODO Add support for end/start icon
type SelectProps<T extends string | number = string | number> = Except<
	CustomInputProps,
	"end" | "start"
> &
	ListboxProps & {
		choices: Choice<T>[]
		className?: string
		required?: boolean
		buttonProps?: Parameters<typeof SelectButton>[0]
		// id?: string
	}

export function Select(props: SelectProps): JSX.Element {
	const {
		className,
		choices,
		label,
		labelPosition,
		error,
		helperText,
		hideRequiredSign,
		buttonProps,
		...rest //
	} = props

	const { x, y, reference, floating, strategy } = useFloating({
		middleware: [offset(props.helperText ? -30 : 0), flip(), shift()],
		placement: "bottom",
		strategy: "absolute",
		whileElementsMounted: autoUpdate,
	})

	// set first value if user did not provide it, and it's required
	useEffect(() => {
		if (!props.required) return
		if (notNil(props.value)) return

		const choice1 = props.choices[0]?.value
		if (isNil(choice1)) return
		props.onChange?.(choice1)
	}, [props, props.required, props.value])

	const currentChoiceText = useMemo(() => {
		const choice = props.choices.find((c) => c.value === props.value)
		return String(choice?.label ?? choice?.value ?? "")
	}, [props.choices, props.value])

	return (
		<Listbox {...rest}>
			<InputWrapper
				ref={reference}
				required={props.required}
				error={props.error}
				labelPosition={props.labelPosition}
				helpText={props.helperText}
				className={clsx("relative", className)}
				label={
					typeof props.label === "string" ? (
						<Listbox.Label
							as={InputLabel}
							required={props.required}
							hideRequiredSign={props.hideRequiredSign}
							// htmlFor={props.id}
							// onClick={() => {
							// 	buttonRef.current?.focus()
							// }}
						>
							{props.label}
						</Listbox.Label>
					) : (
						props.label
					)
				}
			>
				<SelectButton
					{...props.buttonProps}
					error={props.error !== undefined}
					text={currentChoiceText}
				/>

				<Listbox.Options
					ref={floating}
					style={{
						position: strategy,
						top: y ?? 0,
						left: x ?? 0,
					}}
					// calc is because of helper text
					className={clsx(
						" focus:border-neutral-400  z-[1000] w-full rounded border-2 bg-white outline-none",
						"cursor-pointer",
					)}
				>
					{props.required !== true && <SelectOption choice={{ value: "" }} key={-1} />}
					{props.choices.map((choice, i) => (
						<SelectOption choice={choice} key={i} />
					))}
				</Listbox.Options>
			</InputWrapper>
		</Listbox>
	)
}

function SelectButton(props: {
	buttonRef?: RefObject<any>
	text?: string
	className?: string
	error?: boolean
}): JSX.Element {
	return (
		<Listbox.Button
			ref={props.buttonRef}
			className={clsx(
				"s-input s-input-select",
				"flex w-full items-center",
				props.error && "s-input-error",
				props.className,
			)}
		>
			{/* {String(valueLabel)} */}
			{props.text}
			{/* <ArrowDropDown className="absolute right-2" /> */}
		</Listbox.Button>
	)
}

function SelectOption(props: { choice: Choice }): JSX.Element {
	const { choice } = props
	return (
		<Listbox.Option value={choice.value} disabled={choice.disabled}>
			{(params) => {
				return (
					<div
						className={clsx(
							"min-h-text relative h-8 w-full px-2 py-1",
							params.selected && "font-bold",
							params.active ? "bg-blue-100 dark:bg-blue-900" : "dark:bg-neutral-800 bg-white",
							params.disabled && "text-neutral-600",
						)}
					>
						{choice.label ?? String(choice.value)}
					</div>
				)
			}}
		</Listbox.Option>
	)
}
