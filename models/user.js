const { DataTypes } = require('sequelize')
const bcrypt = require("bcryptjs")

const sequelize = require('../lib/sequelize')
const { Assignment } = require('./assignment')
const { User } = require('./user')

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
  'role'
]