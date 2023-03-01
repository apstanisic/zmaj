import { create } from "zustand"
import { DialogPermission } from "../dialog-permission.type"

type AuthzDialogState = {
	permission?: DialogPermission
	showDialog: (perm: DialogPermission) => void
	hideDialog: () => void
}

/**
 * State for showing dialog to enable/change/forbid permission.
 * Prevents prop drilling
 */
export const useAuthzDialogState = create<AuthzDialogState>((set) => ({
	permission: undefined,
	showDialog: (permission) => set({ permission }),
	hideDialog: () => set({ permission: undefined }),
}))
