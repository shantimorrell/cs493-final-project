const { Router, application } = require('express')
const sequelize = require
const { Course } = require('../models/course')
const { Enrollment } = require('../models/enrollment')
const { User } = require('../models/user')
const { Assignment } = require('../models/assignment')
const { validateAgainstSchema } = require('../lib/validation')

const router = Router()

courseSchema = {
    subject: { required: true },
    number: { required: true },
    title: { required: true },
    term: { required: true },
    instructorId: { required: true }
}

enrollmentSchema = {
    add: { required: true },
    delete: { required: true }
}

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

    const courseList = await Course.findAll({
        where: w,
        limit: numPerPage,
        offset: start
    })

    res.status(200).send({
        courses: courseList
    })
})

router.get('/:id', async function (req, res, next) {
    const courseId = parseInt(req.params.id)
    const course = await Course.findByPk(courseId)
    if (course) {
        if (course) {
        res.status(200).send(course)
    } else {
        next()
    }
    } else {
        res.status(400).send({
            error: "no course with that id was found"
        })
    }
    
})

router.get('/:id/students', async function (req, res) {
    const courseId = parseInt(req.params.id)
    const enrollment = await Enrollment.findAll({ where: { courseId: courseId } })
    if (enrollment.length > 0) {
        const users = await User.findAll()
        const id = []
        for (let i = 0; i < enrollment.length; i++) {
            id[id.length] = enrollment[i].studentId
        }
        const students = isStudent(id, users)
        res.status(200).send({
            students: students
        })
    } else {
        res.status(404).send({
            error: "no course with that id found"
        })
    }
})

function isStudent(num, arr) {
    let students = []
    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < num.length; j++) {
            if (arr[i].id == num[j]) {
                students[students.length] = arr[i]
            } else {
                //console.log("num: ", num[j], "arr: ", arr[i].id)
            }
        }
    }
    return students
}

//validate user
router.get('/:id/roster', async function (req, res) {
    const courseId = parseInt(req.params.id)
    const enrollment = await Enrollment.findAll({ where: { courseId: courseId } })
    if (enrollment.length > 0) {
        const users = await User.findAll()
        const id = []
        for (let i = 0; i < enrollment.length; i++) {
            id[id.length] = enrollment[i].studentId
        }
        const students = isStudent(id, users)
        let csv = "name, studentId, email \n"
        for (let i = 0; i < students.length; i++) {
            csv += `${students[i].name}, ${students[i].id}, ${students[i].email}\n`
        }
        res.setHeader('Content-Type', 'text/csv')
        res.setHeader('Content-Disposition', 'attachment; filename-roster.csv')
        res.status(200).send(csv)
    } else {
        res.status(404).send({
            error: "no course with that id found"
        })
    }

})

router.get('/:id/assignments', async function (req, res) {
    const courseId = parseInt(req.params.id)
    const assignment = await Assignment.findAll({ where: { courseId: courseId } })
    if (assignment.length > 0) {
        res.status(200).send({
            assignments: assignment
        })
    } else {
        res.status(400).send({
            error: "no course found with that id"
        })
    }
})

router.post('/', async function (req, res, next) {
    const request = await req.body
    if (validateAgainstSchema(request, courseSchema)) {
        const course = await Course.create(request)
        console.log("course: ", course.toJSON())
        res.status(201).send({
            id: course.id,
            links: {
                course: `/course/${course.id}`
            }
        })
    } else {
        res.status(400).send({
            error: "body is not a valid course object"
        })
    }
})

router.post('/:id/students', async function (req, res, next) {
    const request = await req.body
    if (validateAgainstSchema(request, enrollmentSchema)) {
        const courseId = parseInt(req.params.id)
        const add = request.add
        const remove = request.delete
        const course = await Course.findByPk(courseId)
        if (course) {
            for (let i = 0; i < add.length; i++) {
                await Enrollment.create({
                    studentId: add[i],
                    courseId: courseId
                })
            }
            for (let i = 0; i < remove.length; i++) {
                await Enrollment.destroy({
                    where: {
                        studentId: remove[i],
                        courseId: courseId
                    }
                })
            }
            res.status(200).send()
        } else {
            res.status(404).send({
                error: "course not found"
            })
        }
    } else {
        res.status(400).send({
            error: "body is not a valid object"
        })
    }
})

router.patch('/:id', async function (req, res, next) {
    const request = await req.body
    const courseId = parseInt(req.params.id)
    const course = await Course.findByPk(courseId)
    if (course) {
        if (validateAgainstSchema(request, courseSchema)) {
            const result = await Course.update(request, {
                where: { id: course.id }
            })
            if (result[0] > 0) {
                res.status(204).send()
            }
        } else {
            res.status(400).send({
                error: "body is not valid course object"
            })
        }
    } else {
        next()
    }
})

router.delete('/:id', async function (req, res, next) {
    const courseId = parseInt(req.params.id)
    const course = await Course.findByPk(courseId)
    if (course) {
        const result = await Course.destroy({ where: { id: course.id } })
        if (result > 0) {
            res.status(204).send()
        }
        console.log(result)
    } else {
        next()
    }
})

module.exports = router