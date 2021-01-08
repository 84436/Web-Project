const mongoose = require("mongoose")

var activitySchema = new mongoose.Schema({
    courseID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "course"
    },
    studentID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "account"
    },
    isWatching: {
        type: Boolean,
        default: false
    },
    isEnrolled: {
        type: Boolean,
        default: false
    },
    feedback: {
        rate: Number,
        content: String
    }
})

var activityModel = mongoose.model("activity", activitySchema, "activities")

/********************************************************************************/

async function getWatchingState() {
    let filter = {
        studentID: studentID,
        courseID: courseID
    }
    let projection = { __v: 0 }
    let r = await activityModel.findOne(filter, projection).lean()
    if (r)
        return r.isWatching
    else
        return null
}

async function setWatchingState() {
    let filter = {
        studentID: studentID,
        courseID: courseID
    }
    let update = {
        isWatching: state
    }
    let options = { upsert: false }
    await activityModel.findOneAndUpdate(filter, update, options, (err) => {})
}

async function getEnrollmentState(studentID, courseID) {
    let filter = {
        studentID: studentID,
        courseID: courseID
    }
    let projection = { __v: 0 }
    let r = await activityModel.findOne(filter, projection).lean()
    if (r)
        return r.isEnrolled
    else
        return null
}

async function setEnrollmentState(studentID, courseID, state) {
    let filter = {
        studentID: studentID,
        courseID: courseID
    }
    let update = {
        isEnrolled: state
    }
    let options = { upsert: false }
    await activityModel.findOneAndUpdate(filter, update, options, (err) => {})
}

async function getFeedbackByCourse(courseID) {
    let filter = {
        courseID: courseID
    }
    let projection = { _id:0, studentID: 1, feedback: 1 }
    let r = await activityModel.find(filter, projection, (err) => {
                                    return null
                                })
                               .populate({
                                   path: "studentID",
                                   select: "name"
                                })
                               .lean()
    return r
}

async function getFeedbackByStudent(studentID, courseID) {
    let filter = {
        studentID: studentID,
        courseID: courseID
    }
    let projection = { _id: 0, feedback: 1 }
    return await activityModel.findOne(filter, projection, (err) => {
        return null
    }).lean()
}

async function setFeedback(studentID, courseID, rate, content) {
    let filter = {
        studentID: studentID,
        courseID: courseID
    }
    let update = {
        feedback: {
            rate: rate,
            content: content
        }
    }
    let options = { upsert: false }
    await activityModel.findOneAndUpdate(filter, update, options, (err) => {})
}

/********************************************************************************/

module.exports = {
    getWatchingState     : getWatchingState,
    setWatchingState     : setWatchingState,
    getEnrollmentState   : getEnrollmentState,
    setEnrollmentState   : setEnrollmentState,
    getFeedbackByCourse  : getFeedbackByCourse,
    getFeedbackByStudent : getFeedbackByStudent,
    setFeedback          : setFeedback
}
