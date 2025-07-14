/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { firestore } from './firebase.js'
import { v4 as uuidv4 } from 'uuid'
// import Mail from '@ioc:Adonis/Addons/Mail'
import mail from '@adonisjs/mail/services/main'

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

router.get('/test-firebase', async () => {
  try {
    // Add a dummy document to ensure the collection exists
    const testRef = firestore.collection('test')
    await testRef.doc('demo').set({ initialized: true })

    // Now try to read from the collection
    const result = await testRef.get()

    return {
      success: true,
      message: 'Firebase connection and read successful!',
      documentsCount: result.size,
    }
  } catch (error) {
    return {
      success: false,
      message: 'Firebase connection failed!',
      error: error.message,
    }
  }
})

router.post('/invite', async ({ request, response }) => {
  const email = request.input('email')
  if (!email) return response.badRequest({ error: 'Email is required' })

  const token = uuidv4()

  await firestore.collection('invites').doc(email).set({
    email,
    token,
    used: false,
    created_at: new Date().toISOString(),
  })

  const inviteLink = `http://localhost:3000/signup?email=${encodeURIComponent(email)}&token=${token}`

  await mail.send((message: any) => {
    message
      .to(email)
      .from('admin@yourapp.com') // same as MAIL_FROM_ADDRESS
      .subject('You’re Invited to Join').html(`
        <h2>You're Invited!</h2>
        <p>Click below to sign up:</p>
        <a href="${inviteLink}">${inviteLink}</a>
      `)
  })

  return {
    message: 'Invitation email sent',
    inviteLink,
  }
})

router.post('/verify-invite', async ({ request, response }) => {
  try {
    const { email, token } = await request.body()

    if (!email || typeof email !== 'string') {
      return response.badRequest({ error: 'Email is required' })
    }

    const docRef = firestore.collection('invites').doc(email)
    const docSnap = await docRef.get()

    if (!docSnap.exists) {
      return response.notFound({ error: 'Invite not found' })
    }

    const data = docSnap.data()
    if (!data) {
      return null
    }

    // If token exists in request, verify token
    if (token) {
      if (data.token !== token) {
        return response.badRequest({ error: 'Invalid or expired token' })
      }
    }

    // If already used, notify
    if (data.used) {
      return response.status(409).send({ error: 'Invite already used' })
    }

    return response.ok({ message: 'Invite is valid' })
  } catch (error) {
    console.error('🔥 Error in /verify-invite:', error)
    return response.status(500).send({ error: 'Internal server error' })
  }
})

router.post('/mark-invite-used', async ({ request, response }) => {
  const { email } = await request.body()

  if (!email || typeof email !== 'string') {
    return response.badRequest({ error: 'Valid email is required' })
  }

  const docRef = firestore.collection('invites').doc(email)
  const docSnap = await docRef.get()

  if (!docSnap.exists) {
    return response.notFound({ error: 'Invite not found' })
  }

  const inviteData = docSnap.data()
  if (inviteData?.used === true) {
    return response.ok({ success: false, message: 'Invite already used' })
  }

  await docRef.update({ used: true })

  return response.ok({ success: true, message: 'Invite marked as used' })
})

router.post('/store-valid-user', async ({ request, response }) => {
  try {
    const { email } = await request.body()

    if (!email || typeof email !== 'string') {
      return response.badRequest({ error: 'Valid email is required' })
    }

    const docRef = firestore.collection('valid_users').doc(email)
    const existingUser = await docRef.get()

    if (existingUser.exists) {
      return response.ok({ message: 'User already exists in valid_users' })
    }

    await docRef.set({
      email,
      createdAt: new Date().toISOString(),
    })

    return response.created({ message: 'User stored in valid_users' })
  } catch (error) {
    console.error('🔥 Error in /store-valid-user:', error)
    return response.status(500).send({ error: 'Internal server error' })
  }
})
