const { Router } = require('express')
const { getAssignmentById, Assignment, AssignmentClientFields } = require('../models/assignment')
const { requireInstructorMatchesBody } = require('../models/user')
const { ValidationError } = require('sequelize')
const { requireAuthentication } = require('../lib/auth')

const router = Router()

router.get("/:assignmentId", async function (req, res, next) {
  try {
    const user = await getAssignmentById(req.params.assignmentId)
    if (user) {
      res.status(200).send(user)
    } else {
      next()
    }
  } catch(e) {
    next(e)
  }
})



/*
 * Route to add a new assignment.
 */
router.post('/', requireAuthentication, requireInstructorMatchesBody, async function (req, res, next) {
  try {
    const assignment = await Assignment.create(req.body, AssignmentClientFields)
    res.status(201).send({ id: assignment.id })
  } catch (e) {
    if (e instanceof ValidationError) {
      res.status(400).send({ error: "Request body must contain title, due, and points" })
    } else {
      next(e)
    }
  }
})


module.exports = router