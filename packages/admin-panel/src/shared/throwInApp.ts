import { AdminPanelError } from "./AdminPanelError"

export function throwInApp(message?: string): never {
	throw new AdminPanelError(message ?? "9074213")
}
