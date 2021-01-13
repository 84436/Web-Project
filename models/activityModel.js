const mongoose = require("mongoose")
const courseModel = require('./courseModel')
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
    },
    enrollTime: Date
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

async function getEnrollmentTime(studentID, courseID) {
    let filter = {
        studentID: studentID,
        courseID: courseID
    }
    let projection = { __v: 0 }
    let r = await activityModel.findOne(filter, projection).lean()
    if (r)
        return r.enrollTime
    else
        return null
}

async function setEnrollmentState(studentID, courseID, state) {
    let filter = {
        studentID: studentID,
        courseID: courseID
    }
    let update = {
        enrollTime: new Date("<YYYY-mm-ddTHH:MM:ssZ>")
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
    let updateFeedback = {
        feedback: {
            rate: rate,
            content: content
        }
    }
    let projection = {_id: 1, isEnrolled: 1}
    let options = { upsert: false }
    var is_enrolled = await activityModel.findOne(filter, projection, (err) => {
        return
    })
    console.log(is_enrolled.isEnrolled)
    if(is_enrolled.isEnrolled == false) {
        is_enrolled.isEnrolled = true
        is_enrolled.save()
        await courseModel.enrollCount_plus(courseID)
    }
    await activityModel.findOneAndUpdate(filter, updateFeedback, options, (err) => {})
}

async function getAllWatchList(studentID) {
    let filter = {
        studentID: studentID,
        isWatching: true
    }
    let projection = {
        _id: 0,
        courseID: 1
    }
    let r = await activityModel.find(filter, projection, (err) => {
        return null
    })
    .populate({
        path: "courseID",
        select: "name"
    })
    .lean()
    return r
}

async function saveToWatchList(courseID, studentID) {
    let r = {_error: null}

    let newActivityInfo = {
        courseID: courseID,
        studentID: studentID,
        isWatching: true,
        feedback: null,
        progress: [],
        isEnrolled: false
    }
    let newActivity = activityModel(newActivityInfo)
    await newActivity.save((err) => {
        if (err) { r._error = err; return r}
    })
    
    r = {
        ...r,
        "_id": newActivity.id,
        ...newActivityInfo
    }
    return r
}

async function removeFromWatchList(courseID, studentID) {
    let filter = {
        courseID: courseID,
        studentID: studentID
    }

    let projection = {
        _id: 1,
        isWatching: 1,
        isEnrolled: 1
    }

    let r = await activityModel.findOne(filter, projection, (err) => {
        return null
    })

    console.log(r.isEnrolled)

    if(r.isEnrolled == true) {
        r.isWatching = false
        r.save()
    }
    else {
        let r = await activityModel.findOneAndRemove(filter, (err) => {})
    }
}

/********************************************************************************/

module.exports = {
    getWatchingState     : getWatchingState,
    setWatchingState     : setWatchingState,
    getEnrollmentState   : getEnrollmentState,
    setEnrollmentState   : setEnrollmentState,
    getEnrollmentTime    : getEnrollmentTime,
    setEnrollmentTime    : setEnrollmentTime,
    getFeedbackByCourse  : getFeedbackByCourse,
    getFeedbackByStudent : getFeedbackByStudent,
    setFeedback          : setFeedback,
    getAllWatchList      : getAllWatchList,
    saveToWatchList      : saveToWatchList,
    removeFromWatchList  : removeFromWatchList
}
