// app/controllers/invite_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import InviteService from '#services/invite_service'
import UserService from '#services/registered_user_service'

export default class InviteController {
  // Batch invite
  async sendBatchInvites({ request, response }: HttpContext) {
    const emails = request.input('emails') as string[]
    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return response.badRequest({ error: 'Emails are required in array format' })
    }

    const invites = await InviteService.sendBatchInvites(emails)
    return response.ok({ success: true, invites })
  }

  // Verify invite
  async verifyInvite({ request, response }: HttpContext) {
    const input = request.input('input') // Accept either full link or email

    const result = await InviteService.verifyInvite(input)

    return response.status(result.status).send(result.data)
  }

  // Delete if not invited
  async cleanupIfNotInvited({ request, response }: HttpContext) {
    const email = request.input('email')
    const result = await InviteService.cleanupUninvited(email)
    return response.status(result.status).send(result.data)
  }

  // Mark invite as used
  async markInviteUsed({ request, response }: HttpContext) {
    const email = request.input('email')
    if (!email) return response.badRequest({ error: 'Email is required' })

    const updated = await InviteService.markInviteUsed(email)
    if (!updated) {
      return response.ok({ success: false, message: 'Invite already used or not found' })
    }

    return response.ok({ success: true, message: 'Invite marked as used' })
  }

  // Store user in registered_users
  async storeValidUser({ request, response }: HttpContext) {
    const email = request.input('email')
    if (!email) return response.badRequest({ error: 'Email is required' })

    const user = await UserService.storeValidUser(email)
    return response.ok({ success: true, user })
  }
}
