const { Router } = require('express')
const sequelize = require
const { Course } = require('../models/course')
//const courses = require('../data/courses.json')

const router = Router()

/*
 * Route to return a list of courses.
 */
router.get('/', async function (req, res) {
    const courses = await Course.findAll()
    /*
    * Compute page number based on optional query string parameter `page`.
    * Make sure page is within allowed bounds.
    */
    let page = parseInt(req.query.page) || 1
    let subject = req.query.subject
    let number = req.query.number
    let term = req.query.term

    const numPerPage = 10
    const lastPage = Math.ceil(courses.length / numPerPage)
    page = page > lastPage ? lastPage : page
    page = page < 1 ? 1 : page

    /*
    * Calculate starting and ending indices of courses on requested page and
    * slice out the corresponsing sub-array of courses.
    */
    const start = (page - 1) * numPerPage
    const end = start + numPerPage
    const pageCourses = courses.slice(start, end)

    const links = {}
    if (page < lastPage) {
        links.nextPage = `/courses?page=${page + 1}`
        links.lastPage = `/courses?page=${lastPage}`
    }
    if (page > 1) {
        links.prevPage = `/courses?page=${page - 1}`
        links.firstPage = '/courses?page=1'
    }

    /*
     * Construct and send response.
     */

    let w = {}
    if (subject) {
        w.subject = subject
    }
    if (number) {
        w.number = number
    }
    if (term) {
        w.term = term
    }

    const courses1 = await Course.findAll({
        where: w,
        limit: numPerPage,
        offset: start
    })

    res.status(200).send({
        courses: courses1
    })
})

router.get('/:id', async function (req, res, next) {
    const courseId = parseInt(req.params.courseId)
    const courseId1 = await Course.findByPk(courseId)
    if (courseId1) {
        res.status(200).send(courseId1)
    } else {
        next()
    }
})

router.post('/', async function (req, res, next) {
    try {
        const course = await Course.create(req.body)
        console.log("Course: ", course.toJSON())
        res.status(200).send({
            id: course.id
        })
    } catch (err) {
        next(err)
    }

})

module.exports = router