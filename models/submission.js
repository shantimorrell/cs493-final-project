const { DataTypes } = require('sequelize')

const sequelize = require('../lib/sequelize')
const { Assignment } = require('./assignment')
const { User } = require('./user')

const Submission = sequelize.define('submission', {
    timestamp: { type: DataTypes.DATE, allowNull: false },
    file: { type: DataTypes.TEXT, allowNull: false },
    grade: {
        type: DataTypes.FLOAT, validate: {
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