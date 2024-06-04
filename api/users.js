const { Router } = require('express')
const { getUserById, validateCredentials, User } = require('../models/user')
const { generateAuthToken, requireAuthentication } = require('../lib/auth')

const router = Router()

router.get('/:')



/*
 * Route to log a user in.
 */
router.post('/login', async function (req, res, next) {
  try {
    if (!req.body || !req.body.email || !req.body.password) {
      // Return error if request body does not contain required fields
      res.status(400).send({ error: "Request body must include email and password to login" })
    }
    const authenticated = await validateCredentials(req.body.email, req.body.password)
    if (authenticated) {
      // User's password and email combination are correct, get user and generate token
      const user = await User.findOne({ where: { email: req.body.email } })
      const token = generateAuthToken(user.id)
      res.status(200).send({
        token: token
      })
    } else {
      // User's password and email combination are invalid, return error
      res.status(401).send({
        error: "Invalid authentication credentials"
      })
    }
  } catch (e) {
    next(e)
  }
})


/*
 * Route to get user's information by id.
 */
router.get("/:userId", requireAuthentication, async function (req, res, next) {
  try {
    const user = await getUserById(req.params.userId, false)
    if (user) {
      res.status(200).send(user)
    } else {
      next()
    }
  } catch(e) {
    next(e)
  }
})


module.exports = router