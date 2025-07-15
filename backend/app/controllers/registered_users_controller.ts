import type { HttpContext } from '@adonisjs/core/http'
import RegisteredUser from '#models/registered_user'

export default class RegisteredUsersController {
  /**
   * Store a valid user (called after verifying invite and Firebase signup)
   */
  async store({ request, response }: HttpContext) {
    const { email } = request.only(['email'])

    if (!email || typeof email !== 'string') {
      return response.badRequest({ error: 'Valid email is required' })
    }

    try {
      const user = await RegisteredUser.firstOrCreate({ email })
      return response.ok({ success: true, user })
    } catch (error) {
      console.error('🔥 Error in storing registered user:', error)
      return response.internalServerError({ error: 'Could not store user' })
    }
  }

  /**
   * List all registered users (for admin dashboard)
   */
  async index({ response }: HttpContext) {
    const users = await RegisteredUser.all()
    return response.ok(users)
  }
}
