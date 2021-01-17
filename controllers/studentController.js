const express = require('express')
const router = express.Router()

const accountModel = require("../models/accountModel")
const courseModel = require("../models/courseModel")
const categoryModel = require("../models/categoryModel")
const activityModel = require("../models/activityModel")

router.use(function (i, o, next) {
    if (i.session.User) {
        if (i.session.User.type === "student") {
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

router.get("/enroll/all", async (i, o, next) => {

})

router.post("/enroll/:id", async (i, o, next) => {

})

router.get("/profile", async (i, o, next) => {

})

router.get("/watchlist", async (i, o, next) => {

})

router.post("/watchlist/:id", async (i, o, next) => {

})

router.post("/feedback/:id", async (i, o, next) => {

})


module.exports = router