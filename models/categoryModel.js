const mongoose = require("mongoose");

var categorySchema = new mongoose.Schema({
    major: String,
    minor: String,
});

categorySchema.index({
    major: "text",
    minor: "text",
});

var categoryModel = mongoose.model("category", categorySchema, "categories");

var courseModel = require("./courseModel");

/********************************************************************************/

async function search(query) {
    let filter = { $text: { $search: query } };
    let projection = { __v: 0 };
    return await categoryModel.find(filter, projection, (err) => {
        return null;
    });
}

async function getByID(id) {
    let projection = { __v: 0 };
    return await categoryModel
        .findById(id, projection, (err) => {
            return null;
        })
        .lean();
}

async function getAll() {
    let projection = { __v: 0 };
    let res = await categoryModel
        .find({}, projection, (err) => {
            return null;
        })
        .lean();

    var categoryObj = [];
    var set = false;

    for (var r in res) {
        var major = res[r].major;
        for (var c in categoryObj) {
            if (categoryObj[c].major === major) {
                categoryObj[c].minor.push({
                    _id: res[r]._id,
                    name: res[r].minor,
                });
                set = true;
                break;
            }
        }
        if (set === false) {
            categoryObj.push({
                major: major,
                minor: [{ _id: res[r]._id, name: res[r].minor }],
            });
        }
        set = false;
    }

    return categoryObj;
}

async function add(major, minor) {
    let newCategory = new categoryModel({
        major: major,
        minor: minor,
    });
    newCategory.save((err) => {});
}

async function edit(id, newMajor, newMinor) {
    let update = {
        major: newMajor,
        minor: newMinor,
    };
    let options = { upsert: false };
    await categoryModel.findByIdAndUpdate(id, update, options, (err) => {});
}

async function remove(id) {
    await categoryModel.findByIdAndDelete(id, (err) => {});
}

async function removeIfEmpty(id) {
    let r = { _err: null };
    let courses = await courseModel.get_course_by_category(id);

    if (courses === null) {
        r._err = "Error in checking empty category.";
    } else if (courses.length === 0) {
        await remove(id);
    } else {
        r._err = "Cannot remove category. Maybe it contains courses.";
    }

    return r;
}

/********************************************************************************/

module.exports = {
    search: search,
    getByID: getByID,
    getAll: getAll,
    add: add,
    edit: edit,
    remove: removeIfEmpty,
};
