const { DataTypes } = require('sequelize')

const sequelize = require('../lib/sequelize')
const { Assignment } = require('./assignment')
const { User } = require('./user')

const Submission = sequelize.define('submission', {
    timestamp: { Type: DataTypes.DATE, allowNull: false },
    file: { Type: DataTypes.TEXT, allowNull: false },
    grade: {
        Type: DataTypes.FLOAT, validate: {
            min: 0
        },
        allowNull: true
    }
})

User.hasMany(Submission, { foreignKey: { allowNull: false } })
Submission.belongsTo(User)

Assignment.hasMany(Submission, { foreignKey: { allowNull: false } })
Submission.belongsTo(Assignment)

exports.Submission = Submission

exports.SubmissionClientFields = [
    'file',
    'userId',
    'assignmentId'
]