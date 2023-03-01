import { JSXElementConstructor, ReactNode } from "react"

type NativeElements = JSX.IntrinsicElements

type TypedAsProps2<T extends keyof NativeElements> = {
	as?: T
	children?: ReactNode
} & NativeElements[T]

type TypedAsProps<T> = {
	as?: JSXElementConstructor<T>
	children?: ReactNode
} & T

export type HeadlessInferType<InnerProps, CustomProps = unknown> = CustomProps &
	(InnerProps extends keyof NativeElements ? TypedAsProps2<InnerProps> : TypedAsProps<InnerProps>)
