const { DataTypes, UniqueConstraintError, ValidationError } = require('sequelize')
const bcrypt = require("bcryptjs")

const sequelize = require('../lib/sequelize')
const { Assignment } = require('./assignment')
const { Course } = require('./course')

const User = sequelize.define('user', {
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { 
      type: DataTypes.STRING, 
      allowNull: false, 
      set(value) {
        this.setDataValue('password', bcrypt.hashSync(value, 8))
      } 
    },
    role: { type: DataTypes.ENUM('admin', 'instructor', 'student'), allowNull: false, defaultValue: 'student' }
})


User.hasMany(Course)
Course.belongsTo(User, { foreignKey: { allowNull: false, name: "instructorId" } })


exports.User = User

const UserClientFields = [
  'name',
  'email',
  'password',
  'role'
]
exports.UserClientFields = UserClientFields

/*
 * Insert a new user, checking to see if that email already exists or the request body
 * doesn't contain required name, email, and password fields
 */
exports.insertNewUser = async function (req, res, next) {
  try {
    const user = await User.create(req.body, UserClientFields)
    res.status(201).send({ id: user.id })
  } catch (e) {
    if (e instanceof UniqueConstraintError) {
      res.status(400).send({ error: "An account already exists with that email address" })
    }
    else if (e instanceof ValidationError) {
      res.status(400).send({ error: "Request body must contain a name, email, and password" })
    } else {
      next(e)
    }
  }
}


/*
 * Get a user by their ID. includePassword specifies whether password is returned in response.
 */
async function getUserById(id, includePassword) {
  let excludedAttributes = includePassword ? [] : ['password']
  const user = await User.findByPk(id, {
    attributes: {
      exclude: excludedAttributes
    }
  })
  return user
}
exports.getUserById = getUserById


/*
 * Check user's email and password combination
 */
exports.validateCredentials = async function (email, password) {
  const user = await User.findOne({
    where: {
      email: email
    }
  })
  return user !== null && await bcrypt.compare(password, user.password)
}


/*
 * Require the user is an admin, return error if unauthorized
 */
exports.requireAdmin = async function (req, res, next) {
  try {
    if (req.user && await isAdmin(req.user)) {
      // User is admin, continue
      next()
    } else {
      // User is not admin
      res.status(403).send({
        error: "You must be an admin user to perform this action"
      })
    }
  } catch (e) {
    next(e)
  }
}


/*
 * Require the user matches the userId in the request params, return error if unauthorized
 */
exports.requireUserMatchesParams = async function (req, res, next) {
  try {
    if (await isAdmin(req.user) || (req.user == req.params.userId)) {
      // Authorized user: either admin or matching user
      next()
    } else {
      // Unauthorized: user is not admin and is trying to access another user's info
      res.status(403).send({
        error: "Not authorized to access the specified resource"
      })
    }
  } catch (e) {
    next(e)
  }
}


/*
 * Require the user is an admin, or an instructor matching the instructorId that corresponds to the 
 * courseId in the request body, return error if unauthorized
 */
exports.requireInstructorMatchesBody = async function (req, res, next) {
  try {
    const course = await Course.findByPk(req.body.courseId)
    if (!course) {
      res.status(400).send({ error: "courseId is not valid" })
    }
    if (
      req.role === "admin" ||
      (req.role === "instructor" && course.instructorId === req.user)
    ) {
      // Authorized user: either admin or matching instructor
      next()
    } else {
      // Unauthorized: user is not admin or matching instructor
      res.status(403).send({
        error: "Not authorized to access the specified resource"
      })
    }
  } catch (e) {
    next(e)
  }
}


/*
 * Checks whether a user has admin privileges
 */
async function isAdmin(userId) {
  const user = await User.findByPk(userId)
  if (user && user.role === 'admin') {
    return true
  } else {
    return false
  }
}


/*
 * Checks whether a user has instructor privileges
 */
async function isInstructor(userId) {
  const user = await User.findByPk(userId)
  if (user && user.role === 'instructor') {
    return true
  } else {
    return false
  }
}