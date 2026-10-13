// The app stores the Core address in SQLite and only falls back to CORE_HOST / CORE_PORT when
// that value is empty, but it seeds 127.0.0.1:3000 on first start, so the env vars never apply.
// Seed the settings row from the env vars before the app starts. A value is only replaced while
// it is still the upstream default, so an address saved on the Settings page is never overwritten.
import { DatabaseSync } from 'node:sqlite'

const host = process.env.CORE_HOST
const port = process.env.CORE_PORT ? parseInt(process.env.CORE_PORT, 10) : undefined
if (!host && !port) process.exit(0)
if (port !== undefined && Number.isNaN(port)) {
	console.error('osc-seed-settings: CORE_PORT is not a number, ignoring it')
	process.exit(0)
}

const DEFAULT_HOST = '127.0.0.1'
const DEFAULT_PORT = 3000

const db = new DatabaseSync('/app/data/data.db')
db.exec(`CREATE TABLE IF NOT EXISTS settings (id string PRIMARY KEY, document JSON NOT NULL);`)

const row = db.prepare(`SELECT document FROM settings WHERE id = 'settings'`).get()
const doc = row ? JSON.parse(row.document) : { coreUrl: DEFAULT_HOST, corePort: DEFAULT_PORT }

if (host && (doc.coreUrl ?? DEFAULT_HOST) === DEFAULT_HOST) doc.coreUrl = host
if (port !== undefined && (doc.corePort ?? DEFAULT_PORT) === DEFAULT_PORT) doc.corePort = port

if (row) {
	db.prepare(`UPDATE settings SET document = json(?) WHERE id = 'settings'`).run(JSON.stringify(doc))
} else {
	db.prepare(`INSERT INTO settings (id, document) VALUES ('settings', json(?))`).run(JSON.stringify(doc))
}
console.log(`osc-seed-settings: Core address ${doc.coreUrl}:${doc.corePort}`)
db.close()
