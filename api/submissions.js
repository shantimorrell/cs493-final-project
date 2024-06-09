const { Router } = require('express')
const { Submission } = require('../models/submission')
const { Course } = require('../models/course')
const { Assignment } = require('../models/assignment')
const { Enrollment } = require('../models/enrollment')
const { ValidationError } = require('sequelize')
const { requireAuthentication } = require('../lib/auth')

const router = Router()

/*
 * Only grades can be updated, as allowing any other field to be modified
 * constitutes a potential security/ethics vulnerability and lacks a clear,
 * legitimate use case.
 */
router.patch("/:submissionId", requireAuthentication, async function (req, res, next) {
    try {
        const submission = await Submission.findByPk(req.params.submissionId)
        const assignment = await Assignment.findByPk(submission.assignmentId)
        const course = await Course.findByPk(assignment.courseId)
        const instructor = course.instructorId
        if (((req.user == instructor && req.role == 'instructor') || req.role == 'admin') && req.body.grade) {
            try {
                const result = await Submission.update(req.body, {
                    where: { id: submissionId },
                    fields: ['grade']
                })
                if (result[0] > 0) {
                    res.status(204).send()
                } else {
                    next()
                }
            } catch (e) {
                next(e)
            }
        } else {
            res.status(403).send({
                err: 'Not authorised to modify the specified resource'
            })
        }
    } catch (e) {
        next(e)
    }
})
