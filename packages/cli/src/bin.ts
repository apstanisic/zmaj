#!/usr/bin/env node

import { zmajCli } from "./index.js"

async function main(): Promise<void> {
	await zmajCli()
}

main()
