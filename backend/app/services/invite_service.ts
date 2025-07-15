// app/services/invite_service.ts
import { v4 as uuidv4 } from 'uuid'
import Invite from '#models/invite'
// import admin from 'firebase-admin'
import { admin } from '../../start/firebase.js'

export default class InviteService {
  static async sendBatchInvites(emails: string[]) {
    const invites = await Promise.all(
      emails.map(async (email) => {
        return await Invite.firstOrCreate({ email }, { token: uuidv4(), used: false })
      })
    )
    return invites
  }

  static async verifyInvite(input: string) {
    let email = ''
    let token = ''

    // Extract email & token if it's a URL, otherwise treat as plain email
    try {
      const parsedUrl = new URL(input)
      email = parsedUrl.searchParams.get('email') || ''
      token = parsedUrl.searchParams.get('token') || ''
    } catch {
      email = input
    }

    if (!email) {
      return { status: 400, data: { error: 'Email is required' } }
    }

    const invite = await Invite.findBy('email', email)

    if (!invite) {
      return { status: 404, data: { error: 'Email not invited' } }
    }

    if (token && invite.token !== token) {
      return { status: 401, data: { error: 'Invalid token' } }
    }

    return { status: 200, data: { success: true, message: 'Invite is valid' } }
  }

  static async cleanupUninvited(email: string) {
    try {
      const user = await admin.auth().getUserByEmail(email)
      await admin.auth().deleteUser(user.uid)
      console.log(`✅ Firebase user deleted: ${email}`)
      return {
        status: 200,
        data: { success: true, message: `Deleted ${email} from Firebase` },
      }
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        console.warn(`⚠️ No Firebase user found: ${email}`)
        return {
          status: 404,
          data: { message: 'User not found in Firebase' },
        }
      } else {
        console.error(`🔥 Error deleting Firebase user:`, err.message)
        return {
          status: 500,
          data: { error: 'Failed to delete user from Firebase' },
        }
      }
    }
  }

  static async markInviteUsed(email: string) {
    const invite = await Invite.findBy('email', email)
    if (!invite || invite.used) return null

    invite.used = true
    await invite.save()
    return invite
  }
}
