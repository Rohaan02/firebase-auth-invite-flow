import RegisteredUser from '#models/registered_user'

export default class UserService {
  static async storeValidUser(email: string) {
    return await RegisteredUser.firstOrCreate({ email })
  }

  static async isUserRegistered(email: string) {
    return await RegisteredUser.findBy('email', email)
  }
}
