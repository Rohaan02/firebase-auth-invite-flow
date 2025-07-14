import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs'
import admin from 'firebase-admin'

// 👇 This block replaces __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const serviceAccountPath = join(__dirname, 'firebase-adminsdk-private-key.json')
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'))

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  })
}

export const firestore = admin.firestore()
