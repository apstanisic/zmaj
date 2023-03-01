/**
 * Log and return. Same as `console.log` except it returns provided value
 *
 * It's useful for when you want to print value without changing code to make temp variable,
 * and you can't use debugger. Especially when used inside JSX.
 * @example
 * ```jsx
 * function Test(props) {
 *   return <div>{lr(props.body)}</div>
 * }
 *
 * ```
 *
 * @param value Value to log
 * @returns provided value
 */

export function lr<T>(value: T): T {
	console.log(value)
	return value
}
