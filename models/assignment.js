const { DataTypes } = require('sequelize')

const sequelize = require('../lib/sequelize')
const { User } = require('./user')

const Assignment = sequelize.define('assignment', {
  title: { type: DataTypes.STRING, allowNull: false },
  points: { type: DataTypes.INTEGER, allowNull: true },
  due: { type: DataTypes.DATE, allowNull: false }
})


// Course.hasMany(Assignment, { foreignKey: { allowNull: false } })
// Assignment.belongsTo(Course)


exports.Assignment = Assignment

const AssignmentClientFields = [
  'title',
  'points',
  'due'
]
exports.AssignmentClientFields = AssignmentClientFields
