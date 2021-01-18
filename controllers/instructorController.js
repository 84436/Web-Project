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
            o.redirect("/");
        }
    }
    else {
        o.redirect("/");
    }
})

router.get("/profile", async (i, o, next) => {
    const resultSet = await accountModel.getByID(i.session.User._id);
    if(!resultSet.error){
        o.locals.User = {
            id: i.session.User._id,
            name: resultSet.name,
            email: resultSet.email,
            instructorBio: resultSet.instructorBio === "" ? null : resultSet.instructorBio
        }
    }
    o.render("instructor/myProfile");
})

router.get("/courses", async (i, o, next) => {
    const courses = await courseModel.getCourseByLecturer(i.session.User._id);
    o.locals.listCourses = [];
    for (const item of courses) {
        o.locals.listCourses.push({
            id: item._id,
            name: item.name,
            desc: item.desc.short
        })
    }
    console.log(o.locals.listCourses);
    o.render("instructor/myCourses");
})

router.post("/courses/add", async (i, o, next) => {

})

router.post("/courses/edit/:id", async (i, o, next) => {

})

router.post("/courses/add/:id", async (i, o, next) => {

})

router.post("/profile/edit",async (i, o, next) => {
    let email = i.body.email
    let name = i.body.name
    let instructorBio = i.body.instructorBio
    // Cookie
    let r = await accountModel.edit(i.session.User._id, { email: email, name: name,instructorBio: instructorBio });
    console.log(r);
    if (!r._error) {
        let account = await accountModel.getByID(i.session.User._id);
        i.session.User = {
            _id: account._id,
            name: account.name,
            email: account.email,
            instructorBio: instructorBio,
            type: account.type
        }
        o.locals.User = i.session.User

        o.json(null)
    }
    else {
        o.json(r)
    }
})
router.post("/profile/edit/pass",async (i, o, next) => {
    const resultSet = await accountModel.changePassword(i.session.User._id, i.body.oldPass, i.body.newPass);
    if(resultSet){
        o.json(null);
    }else{
        o.json("Password is incorrect!");
    }
})

module.exports = router