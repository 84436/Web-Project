const mongoose = require("mongoose");
const activityModel = require("./activityModel");

var courseSchema = new mongoose.Schema({
    // course + instructor
    name: String,
    banner: String, // image path
    categoryID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "category",
    },
    desc: {
        short: String,
        long: String,
    },
    instructorID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "account",
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
    publishDate: Date,
    isFinished: Boolean,
    content: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "course_chapter",
        },
    ],
    isEnable: Boolean
});

courseSchema.index({
    name: "text",
});

/**
 * Course: has Chapters
 * Chapter: links back to Course, has Lessons
 * Lesson: links back to Chapter, has actual content
 */

var courseChapterSchema = new mongoose.Schema({
    courseID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "course",
    },
    name: String,
    lessons: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "course_lesson",
        },
    ],
});

var courseLessonSchema = new mongoose.Schema({
    chapterID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "course_chapter",
    },
    name: String,
    video: String, // video path
    text: String, // actual content goes here
});

var courseModel = mongoose.model("course", courseSchema, "courses");
var courseChapterModel = mongoose.model(
    "course_chapter",
    courseChapterSchema,
    "course_chapters"
);
var courseLessonModel = mongoose.model(
    "course_lesson",
    courseLessonSchema,
    "course_lessons"
);

// var categoryModel = require("./categoryModel");


/********************************************************************************/
// Courses

// Get everything about this course and also populates ToC
async function get_course(courseID) {
    let projection = { __v: 0 };
    let r = await courseModel
        .findById(courseID, projection, (err) => {
            return null;
        })
        .lean()
        .populate({
            path: "categoryID",
            select: "major minor",
        })
        .populate({
            path: "instructorID",
            select: "name instructorBio",
        })
        .populate({
            path: "content",
            select: "name"
        });

    return r;
}

async function add_course(courseInfo) {
    let newCourse = new courseModel(courseInfo);
    return newCourse.save();
}

async function remove_course(courseID) {
    await courseModel.findByIdAndDelete(courseID, (err) => { });
}

async function setFinished(courseID) {
    let update = {
        $set: {
            isFinished: true,
        },
    };

    await courseModel.findByIdAndUpdate(courseID, update, (err) => { });
}

/********************************************************************************/
// Update view/enroll/feedbackCount

function viewCount_plus(courseID) {
    let update = { $inc: { viewCount: 1 } };
    courseModel.findByIdAndUpdate(courseID, update, (err) => { });
}

function viewCount_minus(courseID) {
    let update = { $inc: { viewCount: -1 } };
    courseModel.findByIdAndUpdate(courseID, update, (err) => { });
}

function enrollCount_plus(courseID) {
    let update = { $inc: { enrollCount: 1 } };
    courseModel.findByIdAndUpdate(courseID, update, (err) => { });
}

function enrollCount_minus(courseID) {
    let update = { $inc: { enrollCount: -1 } };
    courseModel.findByIdAndUpdate(courseID, update, (err) => { });
}

function feedbackCount_plus(courseID) {
    let update = { $inc: { feedbackCount: 1 } };
    courseModel.findByIdAndUpdate(courseID, update, (err) => { });
}

function feedbackCount_minus(courseID) {
    let update = { $inc: { feedbackCount: -1 } };
    courseModel.findByIdAndUpdate(courseID, update, (err) => { });
}

/********************************************************************************/
// Chapters

// MONGOOSE: GET ID AFTER SAVE
// MONGODB: PUSH to array using update: https://stackoverflow.com/a/33049923
async function add_chapter(courseID, chapterName) {
    let newChapter = new courseChapterModel({
        courseID: courseID,
        name: chapterName,
    });
    let r = await newChapter.save();
    return r;
}

async function update_chapter(chapterID, chapterName) {
    let update = {
        name: chapterName,
    };
    let options = { upsert: false };
    await courseChapterModel.findByIdAndUpdate(
        chapterID,
        update,
        options,
        (err) => { }
    );
}

async function remove_chapter(chapterID) {
    await courseChapterModel.findByIdAndDelete(chapterID, (err) => { });
}

/********************************************************************************/
// Lessons

async function setUpdateTime(courseID) {
    let update = {
        "lastUpdated": new Date()
    }
    let options = { upsert: false }
    await courseModel.findByIdAndUpdate(
        courseID,
        update,
        options,
        (err) => { }
    )
}



/********************************************************************************/
// Top enrolling categories

// https://stackoverflow.com/a/46985745
async function topEnrollCategories() {
    let r1 = await courseModel.aggregate([
        {
            $group: {
                _id: "$categoryID",
                totalEnrollCount: { $sum: "$enrollCount" },
            },
        },
        {
            $sort: {
                totalEnrollCount: -1,
            },
        },
        {
            $lookup: {
                from: "categories",
                localField: "_id",
                foreignField: "_id",
                as: "categoryName",
            },
        },
        {
            $unwind: "$categoryName"
        },
        { $limit: 5 },
        {
            $project: {
                _id: 0,
            },
        },
    ]);
    return r1;
}

// Top view courses
async function topViewCourses() {
    let r = await courseModel
        .find({ isEnable: true }, (err) => {
            if (err) return null;
        })
        .sort({ viewCount: -1 })
        .limit(10)
        .lean();
    return r;
}

// Top new courses
async function newestCourses() {
    let r = await courseModel
        .find({ isEnable: true }, (err) => {
            if (err) return null;
        })
        .sort({ publishDate: -1 })
        .limit(10)
        .lean();
    return r;
}

async function topEnrollByCategory(categoryID, courseID) {
    let filter = {
        categoryID: categoryID,
        _id: { $ne: courseID },
        isEnable: true
    };

    return await courseModel
        .find(filter, (err) => {
            return null;
        })
        .populate({
            path: "instructorID",
            select: "name"
        })
        .sort({ enrollCount: -1 })
        .limit(6)
        .lean();
}

async function topEnrollCourse() {
    return await courseModel
        .find({ isEnable: true }, (err) => {
            if (err) return null;
        })
        .populate({
            path: "instructorID",
            select: "name",
        })
        .sort({ enrollCount: -1 })
        .limit(3)
        .lean();
}

/********************************************************************************/
//PAGINATION NEEDDING

async function getAll(sortPrice, sortRate) {
    let r;
    let filter = {
        isEnable: true
    }

    if (sortPrice) {
        r = await courseModel
            .find(filter, (err) => {
                return null;
            })
            .lean()
            .populate({
                path: "instructorID",
            }).sort({ averageRate: -1 })
    }
    else if (sortRate) {
        r = await courseModel
            .find(filter, (err) => {
                return null;
            })
            .lean()
            .populate({
                path: "instructorID",
            }).sort({ price: 1 })
    }
    else {
        r = await courseModel
            .find(filter, (err) => {
                return null;
            })
            .lean()
            .populate({
                path: "instructorID",
            })
    }

    return r;
}

async function getAllAdmin() {
    let r = await courseModel
        .find({}, (err) => {
            return null;
        })
        .lean()
        .populate({
            path: "instructorID",
        })

    return r;
}

async function getByCategory(categoryID) {
    let filter = {
        categoryID: categoryID,
        isEnable: true
    };

    let r = await courseModel
        .find(filter, (err) => {
            return null;
        })
        .lean()
        .populate({
            path: "instructorID",
        });

    return r;
}

async function getByCategoryList(categories) {
    // use slide (dirty) to pageinate
    let res = [];
    let catList = categories.minor;
    for (var i in catList) {
        res.push(await getByCategory(catList[i]._id.toString()));
    }
    return await res.flat();
}

async function search_course(query, sortPrice, sortRate, categoryObj) {
    // check this and add option sort
    //Check if query is a category
    // let categoryObj = await categoryModel.getAll();
    let listCourse = null;
    let found = false;
    for (let el of categoryObj) {
        if (el.major === query) {
            listCourse = await getByCategoryList(el);
            found = true;
            break;
        } else {
            for (var m in el.minor) {
                if (el.minor[m].name === query) {
                    listCourse = await getByCategory(el.minor[m]._id);
                    found = true;
                    break;
                }
            }
        }
        if (found === true) {
            break;
        }
    }
    if (found === true) {
        if (sortRate) {
            listCourse.sort(function (a, b) {
                return b.averageRate - a.averageRate;
            });
        } else if (sortPrice) {
            listCourse.sort(function (a, b) {
                return a.price - b.price;
            });
        }
        return listCourse;
    }
    else {
        if (sortRate) {
            listCourse = courseModel.find({ $text: { $search: query }, isEnable: true })
                .populate({ path: "instructorID", select: "name" })
                .populate({ path: "categoryID", select: "major minor" })
                .sort({ averageRate: -1 })
                .lean()
        }
        else if (sortPrice) {
            listCourse = courseModel.find({ $text: { $search: query }, isEnable: true })
                .populate({ path: "instructorID", select: "name" })
                .populate({ path: "categoryID", select: "major minor" })
                .sort({ price: 1 })
                .lean()
        }
        return listCourse
    }
}

/********************************************************************************/
// edit course related
// Update info
async function update_course(courseID, courseInfo) {
    let options = { upsert: false };
    await courseModel.findByIdAndUpdate(
        courseID,
        courseInfo,
        options,
        (err) => { }
    );
}

// Add chapter
async function addChapter(courseID, chapterName) {
    let r = await add_chapter(courseID, chapterName);
    let i = await courseModel.findByIdAndUpdate(
        courseID,
        {
            $addToSet: {
                content: r._id,
            },
        },
        (err) => { }
    );
    return i;
}

// Add lesson
async function addLesson(chapterID, lessonInfo) {
    let r = await add_lesson(chapterID, lessonInfo);

    let uploader = require("../config/file-upload");
    let filename = uploader.uploadVideo(lessonInfo.video, r._id);

    await update_lesson(r._id, { video: filename });

    let i = await courseChapterModel.findByIdAndUpdate(
        chapterID,
        {
            $addToSet: {
                lessons: r._id,
            },
        },
        (err) => { }
    );
    return i;
}

/********************************************************************************/
//Helpers

async function getMaxEnroll() {
    let r = courseModel
        .findOne({}, { enrollCount: 1 }, (err) => {
            return 0;
        })
        .sort({ enrollCount: -1 })
        .lean();
    return r;
}

function setBestSeller(currentEnroll, maxEnroll) {
    if (currentEnroll >= 0.8 * maxEnroll) {
        return true;
    }
    return false;
}

function setNew(publishDate) {
    var today = new Date();
    var diff = Math.floor((today - publishDate) / (1000 * 60 * 60 * 24));
    if (diff < 14) {
        return true;
    }
    return false;
}

async function getCourseByLecturer(lecturerID) {
    let filter = {
        instructorID: lecturerID
    }
    let projection = { __v: 0 }
    let r = await courseModel.find(filter, projection, (err) => {
        return null
    })
        .populate({
            path: "instructorID",
            select: "name"
        })
        .populate({
            path: "categoryID",
            select: "major minor"
        })
        .lean()
    return r
}

// Return true if is course instructor, false otherwise
async function isCourseInstructor(courseID, instructorID) {
    let filter = {
        _id: courseID
    }

    let projection = {
        _id: 1,
        instructorID: 1,
    }

    var specificCourse = await courseModel.findOne(filter, projection, (err) => {
        return null
    })

    if (specificCourse.instructorID.equals(instructorID)) return true
    else return false
}

async function setLockCourse(courseID, newState) {
    let filter = {
        _id: courseID
    }

    let projection = {
        __v: 0
    }

    let specificCourse = await courseModel.findOne(filter, projection, (err) => {
        return null
    })
    if (specificCourse) {
        specificCourse.isEnable = newState
        await specificCourse.save()
        console.log(specificCourse.isEnable)
        return specificCourse
    }
    else return null
}


/********************************************************************************/

module.exports = {
    search_course: search_course,
    get_course: get_course,
    add_course: add_course,
    update_course: update_course,
    remove_course: remove_course,
    add_chapter: add_chapter,
    update_chapter: update_chapter,
    remove_chapter: remove_chapter,
    setUpdateTime: setUpdateTime,
    viewCount_plus: viewCount_plus,
    viewCount_minus: viewCount_minus,
    enrollCount_plus: enrollCount_plus,
    enrollCount_minus: enrollCount_minus,
    feedbackCount_plus: feedbackCount_plus,
    feedbackCount_minus: feedbackCount_minus,
    getByCategory: getByCategory,
    topEnrollCategories: topEnrollCategories,
    getByCategoryList: getByCategoryList,
    topViewCourses: topViewCourses,
    newestCourses: newestCourses,
    topEnrollByCategory: topEnrollByCategory,
    getMaxEnroll: getMaxEnroll,
    setFinished: setFinished,
    addChapter: addChapter,
    addLesson: addLesson,
    topEnrollCourse: topEnrollCourse,
    getCourseByLecturer: getCourseByLecturer,
    getAll: getAll,
    getAllAdmin: getAllAdmin,
    isCourseInstructor: isCourseInstructor,
    setLockCourse: setLockCourse
};
