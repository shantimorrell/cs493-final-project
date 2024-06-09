const jwt = require("jsonwebtoken")

const secretKey = "CS 493 Final Project"


/*
 * Generate an JWT for a user that expires in 24 hours
 */
exports.generateAuthToken = function (userId, userRole) {
  const payload = {
    sub: userId,
    role: userRole
  }
  return jwt.sign(payload, secretKey, { expiresIn: "24h" })
}


/*
 * Require the user to be logged in, return error if unauthorized
 */
exports.requireAuthentication = function (req, res, next) {
  const authHeader = req.get("Authorization") || ""
  const authHeaderParts = authHeader.split(" ")
  const token = authHeaderParts[0] === "Bearer" ? authHeaderParts[1] : null

  try {
    const payload = jwt.verify(token, secretKey)
    req.user = payload.sub
    req.role = payload.role
    next()
  } catch (e) {
    res.status(401).send({
      error: "Valid authentication token required"
    })
  }
}
