const mongoose = require("mongoose");

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
    isFinished: Boolean,
    content: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "course_chapter",
        },
    ],
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

/********************************************************************************/
// Courses

async function search_course(query) {
    let filter = { $text: { $search: query } };
    let projection = { __v: 0 };
    return await courseModel
        .find(filter, projection, (err) => {
            return null;
        })
        .lean()
        .populate({
            path: "instructorID",
            select: "name",
        });
}

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
            select: "name",
        })
        .populate({
            path: "content",
            populate: {
                path: "lessons",
                select: "name",
            },
        });

    return r;
}

async function getByCategory(categoryID) {
    let filter = {
        categoryID: categoryID,
    };

    let r = await courseModel
        .find(filter, (err) => {
            return null;
        })
        .lean()
        .populate({
            path: "instructorID",
            select: "name",
        });

    return r;
}

async function add_course(courseInfo) {
    let newCourse = new courseModel(courseInfo);
    newCourse.save((err) => {});
}

async function update_course(courseID, courseInfo) {
    let options = { upsert: false };
    await courseModel.findByIdAndUpdate(
        courseID,
        courseInfo,
        options,
        (err) => {}
    );
}

async function remove_course(courseID) {
    await courseModel.findByIdAndDelete(courseID, (err) => {});
}

/********************************************************************************/
// Update view/enroll/feedbackCount

async function viewCount_plus(courseID) {
    let update = { $inc: {viewCount: 1} }
    await courseModel.findByIdAndUpdate(courseID, update, (err) => {})
}

async function viewCount_minus(courseID) {
    let update = { $inc: {viewCount: -1} }
    await courseModel.findByIdAndUpdate(courseID, update, (err) => {})
}

async function enrollCount_plus(courseID) {
    let update = { $inc: {enrollCount: 1} }
    await courseModel.findByIdAndUpdate(courseID, update, (err) => {})
}

async function viewCount_minus(courseID) {
    let update = { $inc: {enrollCount: -1} }
    await courseModel.findByIdAndUpdate(courseID, update, (err) => {})
}

async function viewCount_plus(courseID) {
    let update = { $inc: {feedbackCount: 1} }
    await courseModel.findByIdAndUpdate(courseID, update, (err) => {})
}

async function viewCount_minus(courseID) {
    let update = { $inc: {feedbackCount: -1} }
    await courseModel.findByIdAndUpdate(courseID, update, (err) => {})
}

/********************************************************************************/
// Chapters

// MONGOOSE: GET ID AFTER SAVE
// MONGODB: PUSH to array using update: https://stackoverflow.com/a/33049923
function add_chapter(courseID, chapterName) {
    let newChapter = new courseChapterModel({
        courseID: courseID,
        name: chapterName,
    });
    let newChapterID;
    newChapter.save((err, doc) => {
        newChapterID = doc.id;
    });
    return newChapterID;
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
        (err) => {}
    );
}

async function remove_chapter(chapterID) {
    await courseChapterModel.findByIdAndDelete(chapterID, (err) => {});
}

/********************************************************************************/
// Lessons

async function get_lesson(lessonID) {
    let projection = { __v: 0 };
    return await courseLessonModel
        .findById(lessonID, projection, (err) => {
            return null;
        })
        .lean();
}

async function add_lesson(chapterID, lessonInfo) {
    let newLesson = new courseLessonModel({
        chapterID: chapterID,
        name: lessonInfo.name,
        text: lessonInfo.text,
        video: lessonInfo.video,
    });
    newLesson.save((err) => {});
}

async function update_lesson(lessonID, lessonInfo) {
    let update = {
        name: lessonInfo.name,
        text: lessonInfo.text,
        video: lessonInfo.video,
    };
    let options = { upsert: false };
    await courseLessonModel.findByIdAndUpdate(
        lessonID,
        update,
        options,
        (err) => {}
    );
}

async function remove_lesson(lessonID) {
    await courseLessonModel.findByIdAndDelete(lessonID, (err) => {});
}

/********************************************************************************/
// Top enrolling categories

// https://stackoverflow.com/a/46985745
async function topEnrollCategory() {
    let r1 = await courseModel.aggregate([
        {$group: {
            _id: "$categoryID",
            totalEnrollCount: {$sum: "$enrollCount"},
        }},
        {$sort: {
            totalEnrollCount: -1
        }},
        {$lookup: {
            from: "categories",
            localField: "_id",
            foreignField: "_id",
            as: "categoryName"
        }},
        {$limit: 4},
        {$project: {
            "_id": 0
        }}
    ])

    return r1
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
    get_lesson: get_lesson,
    add_lesson: add_lesson,
    update_lesson: update_lesson,
    remove_lesson: remove_lesson,
    getByCategory: getByCategory,
    topEnrollCategory : topEnrollCategory
};
