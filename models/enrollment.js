const {DataTypes} = require("sequelize")

const sequelize = require('../lib/sequelize')

const Enrollment = sequelize.define("enrollment", {
    studentId: {type: DataTypes.STRING, allowNull: false},
    courseId: {type: DataTypes.STRING, allowNull: false}
})

exports.Enrollment = Enrollment

const EnrollmentClientFields = [
    'studentId',
    'courseId'
  ]

exports.EnrollmentClientFields = EnrollmentClientFields


