const express = require('express')
const router = express.Router()

const courseModel = require('../models/courseModel')
const categoryModel = require("../models/categoryModel");

const authGuard = require('../helpers/authGuard')
const { route } = require('./homeController')

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

router.get('/category/:id', async (i, o, next) => {
    o.locals.catList = await categoryModel.getAll()
    o.locals.courseList = await courseModel.getByCategory(i.params.id)
    o.render('course/courseList')
})
module.exports = router
