const express = require('express')
const router = express.Router()

const courseModel = require('../models/courseModel')
const authGuard = require('../helpers/authGuard')

router.get('/courselist', async (i, o, next) => {
    o.render('course/courseList')
})

router.post('/courselist', async (i, o, next) => {
    let courseList = await courseModel.get_course(i.body.courseID)
    if(!courseList._error) {
        o.redirect("/courselist")
    }
    else {
        next(courseList._error)
    }
})
module.exports = router
