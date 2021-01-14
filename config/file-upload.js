const fs = require("fs");
const path = require("path");

function uploadVideo(pathUp, id) {
    let ex = pathUp.split(".").pop();
    let pathIn = path.join(__dirname, "../public/videos/" + id + "." + ex);
    fs.copyFileSync(pathUp, pathIn);
    return pathIn;
}

function uploadImage(pathUp, id) {
    let ex = pathUp.split(".").pop();
    let pathIn = path.join(__dirname, "../public/images/" + id + "." + ex);
    fs.copyFileSync(pathUp, pathIn);
    return pathIn;
}

module.exports = {
    uploadVideo: uploadVideo,
    uploadImage: uploadImage,
};
