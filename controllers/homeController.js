const express = require('express');
const activityModel = require('../models/activityModel');
const router = express.Router()

const categoryModel = require("../models/categoryModel");
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

router.get("/courses/:id", async (i, o, next) => {
    o.locals.User = i.session.User
    o.locals.catList = await categoryModel.getAll()
    o.locals.specificCourse = await courseModel.get_course(i.params.id)
    o.locals.relatedCourse = await courseModel.topEnrollByCategory(o.locals.specificCourse.categoryID, o.locals.specificCourse._id)
    o.locals.feedbackList = await activityModel.getFeedbackByCourse(i.params.id)
    o.render('course/courseDetails')
})

router.get("/courses/byQuery/:search", async (i, o, next) => {
    o.locals.User = i.session.User
    o.locals.catList = await categoryModel.getAll()
    if (i.params.search === "all") {
        if (i.query.sort === "price") {
            o.locals.courseList = await courseModel.getAll(true, false)
        }
        else if (i.query.sort === "rate") {
            o.locals.courseList = await courseModel.getAll(false, true)
        }
    }
    else {
        if (i.query.sort === "price") {
            o.locals.courseList = await courseModel.search_course(i.params.search, true, false, o.locals.catList)
        }
        else if (i.query.sort === "rate") {
            o.locals.courseList = await courseModel.search_course(i.params.search, false, true, o.locals.catList)
        }
    }
    o.locals.query = i.params.search
    o.render("course/courseList")
})

module.exports = router