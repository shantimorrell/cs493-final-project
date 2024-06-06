const { Router } = require('express')
const { getAssignmentById } = require('../models/assignment')

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



module.exports = router