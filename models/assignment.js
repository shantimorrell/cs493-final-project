const { DataTypes } = require('sequelize')

const sequelize = require('../lib/sequelize')

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


/*
 * Get an assignment by its ID, excluding the list of submissions
 */
async function getAssignmentById(id) {
  // let excludedAttributes = includePassword ? [] : ['password']
  const assignment = await Assignment.findByPk(id, {
    // attributes: {
    //   exclude: excludedAttributes
    // }
  })
  return assignment
}
exports.getAssignmentById = getAssignmentById

