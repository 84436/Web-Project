const mongoose = global.mongoose
const bcrypt = require("bcrypt")
const { Schema } = require("mongoose")
const { BCRYPT_WORK_FACTOR } = require('../config/bcrypt.json')

var courseSchema = new mongoose.Schema({
    // course + instructor
    name: String,
    banner: String, // image path
    category: {
        main: String,
        sub: String
    },
    desc: {
        short: String,
        long: String
    },
    instructorID: {
        type: Schema.Types.ObjectId,
        ref: "account"
    },

    // pricing
    price: Number,
    discount: Number,

    // metrics
    averageRate: Number,
    viewCount: Number,
    enrollCount: Number,
    feedbackCount: Number,

    // content
    lastUpdated: Date,
    isFinished: Boolean,
    toc: [{
        type: Schema.Types.ObjectId,
        ref: "course_chapter"
    }] // IDs (refs) only
})

var courseContentChapterSchema = new mongoose.Schema({
    name: String,
    lessons: [{
        type: Schema.Types.ObjectId,
        ref: "course_lesson"
    }] // IDs (refs) only
})

var courseContentLessonSchema = new mongoose.Schema({
    name: String,
    video: String, // video path
    text: String // actual content goes here
})

var courseFeedbackSchema = new mongoose.Schema({
    // no population intended here
    courseID: Schema.Types.ObjectId,
    studentID: Schema.Types.ObjectId,
    rate: Number,
    feedback: String
})

var courseModel = mongoose.model("course", courseSchema, "courses")
var courseContentChapterModel = mongoose.model("course_chapter", courseContentChapterSchema, "course_chapters")
var courseContentLessonModel = mongoose.model("course_lesson", courseContentLessonSchema, "course_lessons")
var courseFeedbackModel = mongoose.model("course_feedback", courseFeedbackSchema, "course_feedbacks")

/********************************************************************************/
// Helpers: do X exist?

async function check_courseID(courseID) {

}

async function check_chapterID(chapterID) {
    
}

async function check_lessonID(lessionID) {

}

async function check_feedbackID(feedbackID) {

}

/********************************************************************************/
// Courses (top-level routines)

async function search(query) {

}

// update-deps: 
async function get_course(query) {
}

async function add_course(courseInfo) {

}

async function update_course(courseID, courseInfo) {

}

// remove-deps: chapters (-> lessons by default), feedbacks
async function remove_course(courseID) {

}

/********************************************************************************/
// Chapters

async function add_chapter(courseID, chapterInfo) {

}

async function update_chapter(chapterID, chapterInfo) {

}

// remove-deps: lessons
async function remove_chapter(chapterID) {

}

/********************************************************************************/
// Lessons

async function add_lesson(chapterID, lessonInfo) {

}

async function update_lesson(lessonID, lessonInfo) {

}

async function remove_lesson(lessonID) {

}

/********************************************************************************/
// Feedbacks

async function add_feedback(feedback) {

}

async function update_feedback(feedbackID, feedbackInfo) {

}

// remove-deps: courses (feedbackCount)
async function remove_feedback(feedbackID) {

}

/********************************************************************************/
// Whatever the hell this is //

async function add(info, type) {
    let r = { _error: null }

    r = {...await checkEmail(info.email)}
    if (r._error) return r

    let new_account_info = {
        "email": info.email,
        "phone": info.phone,
        "password": info.password,
        "name": info.name,
        "address": info.address,
        "avatar": info.avatar,
        "type": type
    }
    let new_account = new courseModel(new_account_info)
    await new_account.save((err) => {
        if (err) { r._error = err; return r }
    })

    // WORKAROUND: GET INFO FROM THAT NEWLY CREATED ACCOUNT
    delete(new_account_info.password)
    new_account_info.joinDate = new_account._doc.joinDate
    r = {
        ...r,
        "_id": new_account.id,
        ...new_account_info
    }
    return r
}

async function remove(id) {
    let r = { _error: null }

    r = {...await checkID(id)}
    if (r._error) return r

    await courseModel.findByIdAndRemove(id, (err) => {
        if (err) { r._error = err; return r }
    })

    return r
}

async function edit(id, new_info) {
    let r = { _error: null }

    r = {...await checkID(id)}
    if (r._error) return r

    r = {...await checkEmail(new_info.email)}
    if (r._error) return r

    let updated_fields = {
        "email": new_info.email,
        "phone": new_info.phone,
        "password": new_info.password,
        "name": new_info.name,
        "address": new_info.address,
        "avatar": new_info.avatar,
    }

    // remove undefined fields
    // https://stackoverflow.com/a/38340374
    Object.keys(updated_fields).forEach(key => {
        (updated_fields[key] === undefined) && (delete updated_fields[key])
    })

    // if everything"s undefined, silently return
    if (Object.keys(updated_fields).length === 0) {
        return r
    }

    await courseModel.findByIdAndUpdate(id, updated_fields, (err) => {
        if (err) { r._error = err; return r }
    })

    return r
}

async function getByID(id) {
    let r = { _error: null }

    r = {...await checkID(id)}
    if (r._error) return r

    let projection = {
        __v: 0
    }
    let account = await courseModel.findById(id, projection, (err) => {
        if (err) { r._error = err; return r }
    })
        
    r = {...r, ...account._doc}
    return r
}

/********************************************************************************/

module.exports = {
    add: add,
    remove: remove,
    edit: edit,
    getByID: getByID
}
