const { Router } = require('express')
const { Submission } = require('../models/submission')
const { Course } = require('../models/course')
const { Assignment } = require('../models/assignment')
const { Enrollment } = require('../models/enrollment')
const { ValidationError } = require('sequelize')
const { requireAuthentication } = require('../lib/auth')

const router = Router()

router.post("/:assignmentId/submissions", requireAuthentication, async function (req, res, next) {
    try {
        const student = req.body.userId
        const assignment = await Assignment.findByPk(req.params.assignmentId)
        const course = assignment.courseId
        const enrollment = await Enrollment.findOne({ where: { courseId: course, userId: student } })
        if (enrollment !== null && (req.user === student || req.role === 'admin')) {
            try {
                const submission = await Submission.create(req.body, SubmissionClientFields)
                res.status(201).send({ id: submission.id })
            } catch (e) {
                if (e instanceof ValidationError) {
                    res.status(400).send({ error: e.message })
                } else {
                    next(e)
                }
            }
        }
    } catch (e) {
        next(e)
    }
})

router.get("/:assignmentId/submissions", requireAuthentication, async function (req, res, next) {
    try {
        const assignment = await Assignment.findByPk(req.params.assignmentId)
        const course = assignment.courseId
        const instructor = course.instructorId
        if (req.user === instructor || req.role === admin) {
            /*
             * Compute page number based on optional query string parameter `page`.
             * Make sure page is within allowed bounds.
             */
            let page = parseInt(req.query.page) || 1
            page = page < 1 ? 1 : page
            const numPerPage = 10
            const offset = (page - 1) * numPerPage
            try {
                const result = await Submission.findAndCountAll({
                    where: { assignmentId: assignent },
                    limit: numPerPage,
                    offset: offset
                })

                /*
                 * Generate HATEOAS links for surrounding pages.
                 */
                const lastPage = Math.ceil(result.count / numPerPage)
                const links = {}
                if (page < lastPage) {
                    links.nextPage = `/assignments/${assignment}/submissions?page=${page + 1}`
                    links.lastPage = `/assignments/${assignment}/submissions?page=${lastPage}`
                }
                if (page > 1) {
                    links.prevPage = `/assignments/${assignment}/submissions?page=${page - 1}`
                    links.firstPage = `/assignments/${assignment}/submissions?page=1`
                }

                /*
                 * Construct and send response.
                 */
                res.status(200).send({
                    submissions: result.rows,
                    pageNumber: page,
                    totalPages: lastPage,
                    pageSize: numPerPage,
                    totalCount: result.count,
                    links: links
                })
            } catch (e) {
                next(e)
            }
        } else {
            res.status(403).send({
                error: 'Not authorised to view the specified resource'
            })
        }
    } catch (e) {
        next(e)
    }
})