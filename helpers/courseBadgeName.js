var courseModel = require("../models/courseModel")

async function setBadge(courses) {
    let maxEnroll = await courseModel.getMaxEnroll();
    
    for (let c of courses) {
        let isBestSeller = false;
        let isNew = false;
        if (c.enrollCount >= 0.8 * maxEnroll) {
            isBestSeller = true;
        }
        if (Math.round((new Date() - c.publishDate) / (1000 * 60 * 60 * 24) < 14)) {
            isNew = true;
        }
        if (isBestSeller && isNew) {
            Object.assign(c, { badgeName: "Hot and new" });
        }
        else if (isBestSeller && !isNew) {
            Object.assign(c, { badgeName: "Best seller" });
        }
        else if (!isBestSeller && isNew) {
            Object.assign(c, { badgeName: "New" });
        }
        else {
            Object.assign(c, { badgeName: "" });
        }
    }
    return courses
}

module.exports = {
    setBadge: setBadge
}