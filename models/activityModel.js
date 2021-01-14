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
    enrollDate: Date
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

async function getEnrollmentDate(studentID, courseID) {
    let filter = {
        studentID: studentID,
        courseID: courseID
    }
    let projection = { __v: 0 }
    let r = await activityModel.findOne(filter, projection).lean()
    if (r)
        return r.enrollDate
    else
        return null
}

async function setEnrollmentDate(studentID, courseID, time) {
    let filter = {
        studentID: studentID,
        courseID: courseID
    }
    let update = {
        enrollDate: time
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
    await activityModel.findOneAndUpdate(filter, updateFeedback, options, (err) => {})
    rateList = await getAllSpecificCourseActivity(courseID)
    var sum = rateList.reduce(function(a, b) {
        return a + b
    }, 0)

    let filter2 = {
        courseID: courseID
    }
    let projection2 = {
        _id: 1,
        feedbackCount: 1,
        averageRate: 1
    }

    let specificCourse = await courseModel.findOne(filter2, projection2, (err) => {return null})
    specificCourse.averageRate = Math.round(sum / specificCourse.feedbackCount)
    specificCourse.save()
    console.log(specificCourse)
}


async function getAllSpecificCourseActivity(courseID) {
    let projection = { feedback: 1 };
    let res = await activityModel
        .find({"courseID": courseID}, projection, (err) => {
            return null;
        })
        .lean();
    rateList = []
    res.forEach(element => {
        if(element.feedback) {
            rateList.push(element.feedback.rate)
        }
    });
    return rateList
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
        path: "courseID"
    })
    .lean()
    return r
}

async function saveToWatchList(courseID, studentID) {
    let r = {_error: null}
    let filter = {
        courseID: courseID,
        studentID: studentID
    }

    let projection = {
        _id: 1,
        isEnrolled: 1
    }

    let activity = await activityModel.findOne(filter, projection, (err) => {
        return null
    })
    if(activity === null) {
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
    else {
        activity.isWatching = true
        await activity.save()
    }

    return r = {...r, ...activity._doc}
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

    if(r.isEnrolled === true) {
        r.isWatching = false
        await r.save()
    }
    else {
        let r = await activityModel.findOneAndRemove(filter, (err) => {})
    }
}

async function getAllEnrollList(studentID) {
    let filter = {
        studentID: studentID,
        inEnrolled: true
    }
    let projection = {
        _id: 0,
        courseID: 1
    }
    let r = await activityModel.find(filter, projection, (err) => {
        return null
    })
    .populate({
        path: "courseID"
    })
    .lean()
    return r
}

async function enrollCourse(studentID, courseID) {
    let r = { _error : null }
    
    let filter = {
        studentID: studentID,
        courseID: courseID
    }

    let projection = {
        _id: 1,
        isWatching: 1,
        isEnrolled: 1
    }

    specificCourse = await activityModel.findOne(filter, projection, (err) => {
        return null
    })

    if(specificCourse === null) {

        let newActivityInfo = {
            courseID: courseID,
            studentID: studentID,
            isWatching: false,
            feedback: null,
            progress: [],
            isEnrolled: true,
            enrollDate: new Date()
        }
        let newActivity = activityModel(newActivityInfo)
        await newActivity.save((err) => {
            if (err) { r._error = err; return r}
        })
        courseModel.enrollCount_plus(courseID)

        r = {
            ...r,
            "_id": newActivity.id,
            ...newActivityInfo
        }
        return r
    }
    else if(specificCourse.isEnrolled === false) {
        specificCourse.isEnrolled = true
        await specificCourse.save()
        courseModel.enrollCount_plus(courseID)
        r = {...r, ...specificCourse }
        return r                                
    }
    
    else { r._error = "Course has been enrolled"; return r}
}

/********************************************************************************/

module.exports = {
    getWatchingState     : getWatchingState,
    setWatchingState     : setWatchingState,
    getEnrollmentState   : getEnrollmentState,
    setEnrollmentState   : setEnrollmentState,
    getEnrollmentDate    : getEnrollmentDate,
    setEnrollmentDate    : setEnrollmentDate,
    getFeedbackByCourse  : getFeedbackByCourse,
    getFeedbackByStudent : getFeedbackByStudent,
    setFeedback          : setFeedback,
    getAllSpecificCourseActivity: getAllSpecificCourseActivity,
    getAllWatchList      : getAllWatchList,
    saveToWatchList      : saveToWatchList,
    removeFromWatchList  : removeFromWatchList,
    getAllEnrollList     : getAllEnrollList,
    enrollCourse         : enrollCourse
}
