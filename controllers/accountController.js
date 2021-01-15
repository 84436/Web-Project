const express = require('express')
const router = express.Router()

const accountModel = require('../models/accountModel')
const activityModel = require("../models/activityModel")

router.use(function (i, o, next) {
    console.log(i.session.User)
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

router.get("/info", async (i, o, next) => {
    o.json("my info")
})

router.get('/account/enrolled', async (i, o, next) => {
    let a = await activityModel.getAllEnrollList(i.session.User._id)
    console.log(a)
    o.render('account/myEnrolled')
})

module.exports = router
