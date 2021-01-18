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

router.get("/enroll", async (i, o, next) => {
})

router.post("/enroll/:id", async (i, o, next) => {

})

router.get("/profile", async (i, o, next) => {
    let r = await accountModel.getByID(i.session.User._id)
    let account = {
        email: r.email,
        name: r.name,
    }
    o.locals.User = account
    o.locals.catList = await categoryModel.getAll()
    o.render("student/myProfile")
})

router.post("/profile/edit", async (i, o, next) => {
    let email = i.body.email
    let name = i.body.name

    // Cookie
    let r = await accountModel.edit(i.session.User._id, { email: email, name: name });

    if (!r._error) {
        let account = await accountModel.getByID(i.session.User._id);
        console.log(account)
        i.session.User = {
            _id: account._id,
            name: account.name,
            email: account.email,
            type: account.type
        }
        o.locals.User = i.session.User

        o.json(null)
    }
    else {
        o.json(r)
    }
})

router.get("/watchlist", async (i, o, next) => {

})

router.post("/watchlist/:id", async (i, o, next) => {

})

router.post("/feedback/:id", async (i, o, next) => {

})


module.exports = router