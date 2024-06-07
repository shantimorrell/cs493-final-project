// From assignment 3 starter code

/*
 * This require() statement reads environment variable values from the file
 * called .env in the project directory.  You can set up the environment
 * variables in that file to specify connection information for your own DB
 * server.
 */
require('dotenv').config()

const express = require('express')
const morgan = require('morgan')

const api = require('./api')
const sequelize = require('./lib/sequelize')

const app = express()
const port = process.env.PORT || 8000

/*
 * Morgan is a popular request logger.
 */
app.use(morgan('dev'))

app.use(express.json())

app.get('/media/submissions/:filename', requireAuthentication, async function (req, res, next) {
    try {
        submission = await Submission.findOne({ where: { file: filename } })
        if (submission) {
            assignment = await Assignment.findByPk(submission.assignmentId)
            course = await Course.findByPk(assignment.courseId)
            instructor = course.instructorId
            student = submission.userId
            if (req.user === student || req.user === instructor || req.role === 'admin') {
                res.sendFile(`${__dirname}/data/submissions/${filename}`)
            }
        } else {
            res.status(404).send({
                err: "Requested resource not found"
            })
        }
    } catch (e) {
        next(e)
    }
})

/*
 * All routes for the API are written in modules in the api/ directory.  The
 * top-level router lives in api/index.js.  That's what we include here, and
 * it provides all of the routes.
 */
app.use('/', api)

app.use('*', function (req, res, next) {
    res.status(404).send({
        error: `Requested resource "${req.originalUrl}" does not exist`
    })
})

/*
 * This route will catch any errors thrown from our API endpoints and return
 * a response with a 500 status to the client.
 */
app.use('*', function (err, req, res, next) {
    console.error("== Error:", err)
    res.status(500).send({
        error: "Server error.  Please try again later."
    })
})

/*
 * Start the API server listening for requests after establishing a connection
 * to the MySQL server.
 */
sequelize.sync().then(function () {
    app.listen(port, function () {
        console.log("== Server is running on port", port)
    })
})