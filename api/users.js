const { Router } = require('express')
const { getUserById, validateCredentials, User, insertNewUser, requireAdmin, requireUserMatchesParams } = require('../models/user')
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
      const token = generateAuthToken(user.id, user.role)
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
 * Route to add new user.
 */
router.post("/", 
  async function(req, res, next) {
    if (!req.body.role || req.body.role === 'student') {
      // No authentication necessary to create student user (default role is student if no role specified)
      await insertNewUser(req, res, next)
    } else {
      // Require admin authentication for creating user with admin or instructor privileges
      next()
    }
  }, 
  requireAuthentication, 
  requireAdmin,
  insertNewUser
)


/*
 * Route to get user's information by id.
 */
router.get(
  "/:userId", 
  requireAuthentication, 
  requireUserMatchesParams, 
  async function (req, res, next) {
    console.log("req.user", req.user, req.role)
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
  }
)


module.exports = router