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
    o.locals.catList = await categoryModel.getAll()
    o.locals.User = i.session.User
    o.locals.courseList = await activityModel.getAllEnrollList(i.session.User._id)
    o.render("student/myEnrolled")
})

router.post("/enroll", async (i, o, next) => {
    const resultSet = await activityModel.enrollCourse(i.session.User._id, i.body.id);
    o.json(resultSet._error);
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

router.post("/profile/edit/pass", async (i, o, next) => {
    const resultSet = await accountModel.changePassword(i.session.User._id, i.body.oldPass, i.body.newPass);
    if (resultSet) {
        o.json(null);
    } else {
        o.json("Password is incorrect!");
    }
})

router.get("/watchlist", async (i, o, next) => {
    o.locals.catList = await categoryModel.getAll()
    o.locals.User = i.session.User
    o.locals.courseList = await activityModel.getAllWatchList(i.session.User._id)
    o.render("student/myWatchList")
})

router.get("/watchlist/remove/:id", async (i, o, next) => {
    o.locals.catList = await categoryModel.getAll()
    o.locals.User = i.session.User
    await activityModel.removeFromWatchList(i.params.id, i.session.User._id)
    o.locals.courseList = await activityModel.getAllWatchList(i.session.User._id)
    o.redirect("/student/watchlist")
})

router.post("/watchlist", async (i, o, next) => {
    const resultSet = await activityModel.saveToWatchList(i.body.id, i.session.User._id);
    o.json(resultSet._error);
})

router.post("/feedback", async (i, o, next) => {
    const resultSet = await activityModel.setFeedback(i.session.User._id, i.body.id,parseInt(i.body.rating), i.body.feedback);
    o.json(null);
})


module.exports = router