const { DataTypes } = require('sequelize')
const bcrypt = require("bcryptjs")

const sequelize = require('../lib/sequelize')
const { Assignment } = require('./assignment')

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


exports.User = User

exports.UserClientFields = [
  'name',
  'email',
  'password',
  'role'
]



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

