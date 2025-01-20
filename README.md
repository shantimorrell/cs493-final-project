# API for a Course Management Tool

This is a prototype for a simple API for a course management tool (a lighter-weight version of something like Canvas).

This API has various endpoints relating to users, courses, assignments, and submissions. Many endpoints require authorization. The API is rate-limited to 10 requests/min without authentication and 30 requests/min with valid authentication. 

Additionally, the `GET /courses` and `GET /assignments/{id}/submissions` endpoints are paginated.

This API is meant to run with Docker containers running MySQL and Redis (for rate-limiting). `prompts.txt` describes steps to run.

## OpenAPI Specification

Please see `openapi.yaml` for the full OpenAPI specification provided by Dr. Hess for this assignment.


<br>

*Please Note:*
This was a final project for a Cloud Application Development course. This API is not deployed, and its features are limited because of the scope of the assignment and class.