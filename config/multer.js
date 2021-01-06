const multer = require("multer")

// https://github.com/expressjs/multer
const imageUpload = multer({
    dest: "../public/img"
})

module.exports = {
    imageUpload: imageUpload
}
