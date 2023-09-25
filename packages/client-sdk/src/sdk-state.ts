import { AuthUser, getJwtContent } from "@zmaj-js/common"
import { EventEmitter } from "eventemitter3"
import { AuthEventFn } from "./auth/auth.client"
import { BaseStorage } from "./storage/base-storage.type"
import { storage } from "./storage/storage"

type SdkStateParams = {
	sdkName?: string
	accessToken?: string
	emitter: EventEmitter<{ auth: AuthEventFn }>
	storage?: BaseStorage
}

export class SdkState {
	private emitter: EventEmitter<{ auth: AuthEventFn }>
	private readonly storageKey: string
	private _accessToken: string | null = null
	private _currentUser?: AuthUser
	private storage: BaseStorage

	constructor(params: SdkStateParams) {
		this.emitter = params.emitter
		this.storageKey = `ZMAJ_STORAGE_${params.sdkName ?? "DEFAULT"}`
		this.storage = params.storage ?? storage
		this.setAccessToken(params.accessToken ?? this.storage.getItem(this.storageKey))

		if (typeof globalThis.window !== "undefined") {
			globalThis.window.addEventListener("storage", (e) => this.onStorageEvent(e))
		}
	}

	private onStorageEvent(event: StorageEvent): void {
		if (event.storageArea !== window?.localStorage) return
		if (event.key !== this.storageKey) return

		this.setAccessToken(event.newValue)

		// if new value is null it's logout
		if (event.newValue === null) {
			this.emitter.emit("auth", "sign-out")
		}
		// if there is old value, and new value is not null, it's refresh
		else if (event.oldValue) {
			this.emitter.emit("auth", "refresh")
		}
		// if there is no old value and is new value, it's login
		else {
			this.emitter.emit("auth", "sign-in")
		}
	}

	setAccessToken(token: string | null): void {
		this._accessToken = token

		if (token === null) {
			this._currentUser = undefined
			this.storage.removeItem(this.storageKey)
		} else {
			this._currentUser = AuthUser.fromUnknown(getJwtContent(token))
			this.storage.setItem(this.storageKey, token)
		}
	}

	getAccessToken(): string | null {
		return this._accessToken
	}
	get currentUser(): AuthUser | undefined {
		// it causes problems if I do not clone
		return this._currentUser?.clone()
	}
}
