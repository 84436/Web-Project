const express = require('express')
const router = express.Router()

const accountModel = require("../models/accountModel")
const courseModel = require("../models/courseModel")
const categoryModel = require("../models/categoryModel")
const activityModel = require("../models/activityModel")

router.use(function (i, o, next) {
    if (i.session.User) {
        if (i.session.User.type === "instructor") {
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

router.get("/profile", async (i, o, next) => {

})

router.get("/courses/all", async (i, o, next) => {

})

router.post("/courses/add", async (i, o, next) => {

})

router.post("/courses/edit/:id", async (i, o, next) => {

})

router.post("/courses/add/:id", async (i, o, next) => {

})



module.exports = router