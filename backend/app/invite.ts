import { firestore } from '../start/firebase.js'
import { v4 as uuidv4 } from 'uuid'

const email = 'user@example.com'
const token = uuidv4()

await firestore
  .collection('invites')
  .doc(token)
  .set({
    email,
    used: false,
    expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2), // expires in 1 days
  })
