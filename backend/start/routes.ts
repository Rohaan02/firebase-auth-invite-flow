/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import InviteController from '#controllers/invites_controller'

router
  .group(() => {
    router.post('/invite', [InviteController, 'sendBatchInvites']) // emails: string[]
    router.post('/verify-invite', [InviteController, 'verifyInvite']) // email, token?
    router.post('/cleanup-uninvited', [InviteController, 'cleanupIfNotInvited']) // email from verify-invite
    router.post('/mark-invite-used', [InviteController, 'markInviteUsed']) // email
    router.post('/store-valid-user', [InviteController, 'storeValidUser']) // email
  })
  .prefix('/api')

router.get('/', async () => {
  return {
    hello: 'world',
  }
})
