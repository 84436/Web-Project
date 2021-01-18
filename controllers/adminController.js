const express = require('express')
const router = express.Router()

const accountModel = require("../models/accountModel")
const courseModel = require("../models/courseModel")
const categoryModel = require("../models/categoryModel")
const activityModel = require("../models/activityModel")
const { BCRYPT_WORK_FACTOR } = require('../config/bcrypt.json')
const bcrypt = require("bcrypt")

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
    o.locals.catList = await categoryModel.getAll()
    o.locals.User = i.session.User
    o.locals.listInstructors = await accountModel.getAllLecturer();
    o.render("admin/instructorList");
})

router.post("/instructors/add", async (i, o, next) => {
    let r = await accountModel.add({ email: i.body.email, name: i.body.name, password: bcrypt.hashSync("pass", BCRYPT_WORK_FACTOR) }, "instructor", true, false)
    if (r._error) {
        o.json(r._error)
    } else {
        o.json(null)
    }
})

router.post("/instructors/setActive", async (i, o, next) => {
    const resultSet = await accountModel.setLockAccount(i.body.id, i.body.active === 'false');
    o.json(resultSet !== null ? null : "Something wrong!");
})

router.get("/students", async (i, o, next) => {
    o.locals.catList = await categoryModel.getAll()
    o.locals.User = i.session.User
    o.locals.listStudents = await accountModel.getAllStudent();
    o.render("admin/studentList");
})

router.post("/students/setActive", async (i, o, next) => {
    const resultSet = await accountModel.setLockAccount(i.body.id, i.body.active === 'false');
    o.json(resultSet !== null ? null : "Something wrong!");
})

router.get("/categories", async (i, o, next) => {
    o.locals.catList = await categoryModel.getAll()
    o.locals.catRaw = await categoryModel.getRaw()
    o.locals.User = i.session.User
    o.render("admin/categoryList")
})

router.post("/categories/add", async (i, o, next) => {
    let check = await categoryModel.checkDuplicate(i.body.major, i.body.minor);
    if (check) {
        o.json("Duplicate category. Check your input")
    }
    else {
        await categoryModel.add(i.body.major, i.body.minor);
        o.json(null)
    }
})

router.post("/categories/edit/:id", async (i, o, next) => {

})

router.post("/categories/delete/:id", async (i, o, next) => {

})

router.get("/courses", async (i, o, next) => {

})

module.exports = router