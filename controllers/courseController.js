const express = require("express");
const router = express.Router();

const courseModel = require("../models/courseModel");
const categoryModel = require("../models/categoryModel");

const authGuard = require("../helpers/authGuard");
const { route } = require("./homeController");
const activityModel = require("../models/activityModel");

router.get("/category/:id", async (i, o, next) => {
    o.locals.catList = await categoryModel.getAll();
    o.locals.courseList = await courseModel.getByCategory(i.params.id);
    o.render("course/courseList");
});

router.get("/course/:id", async (i, o, next) => {
    o.locals.specificCourse = await courseModel.get_course(i.params.id);
    o.locals.feedbackList = await activityModel.getFeedbackByCourse(
        i.params.id
    );

    o.render("course/courseDetails");
});

router.get("/course/:id", async (i, o, next) => {
    o.render("course/courseDetails");
});

router.get("/minor/:id", async (i, o, next) => {
    o.locals.catList = await categoryModel.getAll();
    o.locals.courseList = await courseModel.getByCategory(i.params.id);
    o.render("course/courseList");
});

// router.get("/major/:major", async (i, o, next) => {
//     o.locals.catList = await categoryModel.getAll();
//     o.locals.courseList = await courseModel.search_course(
//         i.params.major,
//         true,
//         false
//     );
//     o.render("course/courseList");
// })

module.exports = router;
