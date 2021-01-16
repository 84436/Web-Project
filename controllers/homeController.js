const express = require('express')
const router = express.Router()

const categoryModel = require("../models/categoryModel")
const courseModel = require("../models/courseModel");

router.get('/', async (i, o, next) => {
    o.locals.catList = await categoryModel.getAll();
    o.locals.hotCourses = await courseModel.topEnrollCourse()
    o.locals.mostViewCourses = await courseModel.topViewCourses()
    o.locals.newestCourses = await courseModel.newestCourses()
    o.locals.topCategories = await courseModel.topEnrollCategories()

    o.locals.User = i.session.User

    if (!o.locals.User) {
        o.render('home/homeGuest')
    }
    else {
        switch (o.locals.User.type) {
            case "student":
                o.render('home/homeStudent')
                break;
            case "instructor":
                o.render('home/homeInstructor')
                break;
            case "admin":
                o.render('home/homeAdmin')
                break;
            default:
                next(new Error())
        }
    }
})

module.exports = router
