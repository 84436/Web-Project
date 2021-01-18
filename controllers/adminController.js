const express = require('express')
const router = express.Router()

const accountModel = require("../models/accountModel")
const courseModel = require("../models/courseModel")
const categoryModel = require("../models/categoryModel")
const activityModel = require("../models/activityModel")

router.use(function (i, o, next) {
    if (i.session.User) {
        if (i.session.User.type === "admin") {
            return next();
        }
        else {
            o.redirect("/")
        }
    }
    else {
        o.redirect("/")
    }
})

router.get("/instructors", async (i, o, next) => {
    o.locals.listInstructors = await accountModel.getAllLecturer();
    o.render("admin/instructorList");
})

router.post("/instructors/add", async (i, o, next) => {
    
})

router.post("/instructors/setActive", async (i, o, next) => {
    const resultSet = await accountModel.setLockAccount(i.body.id, i.body.active === 'false');
    o.json(resultSet !== null ? null : "Something wrong!");
})

router.get("/students", async (i, o, next) => {
    o.locals.listStudents = await accountModel.getAllStudent();
    o.render("admin/studentList");
})

router.post("/students/setActive", async (i, o, next) => {
    const resultSet = await accountModel.setLockAccount(i.body.id, i.body.active === 'false' );
    o.json(resultSet !== null ? null : "Something wrong!");
})

router.get("/categories", async (i, o, next) => {
    
})

router.post("/categories/add", async (i, o, next) => {

})

router.post("/categories/edit/:id", async (i, o, next) => {

})

router.post("/categories/delete/:id", async (i, o, next) => {

})

router.get("/courses", async (i, o, next) => {

})

router.post("/courses/disable/:id", async (i, o, next) => {

})

module.exports = router