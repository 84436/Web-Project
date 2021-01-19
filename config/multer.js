const multer = require("multer")

// https://github.com/expressjs/multer
const imageUpload = multer({
    dest: "../public/images/banner"
})

module.exports = {
    imageUpload: imageUpload
}
