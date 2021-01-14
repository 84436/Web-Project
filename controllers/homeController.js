const express = require('express')
const router = express.Router()

const categoryModel = require("../models/categoryModel")
const courseModel = require("../models/courseModel");

router.get('/', async (i, o) => {    
    o.locals.catList = await categoryModel.getAll();
    o.locals.hotCourses = await courseModel.topEnrollCourse()
    o.locals.mostViewCourses = await courseModel.topViewCourses()
    o.locals.newestCourses = await courseModel.newestCourses()
    o.locals.topCategories = await courseModel.topEnrollCategories()
    let a = i.session.User
    
    if (a) {
        o.locals.User = a 
    }
    
    o.render('home');
})

module.exports = router
