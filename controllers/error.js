const express = require('express')
const router = express.Router()

const o_invalid = (i, o, next) => {
    o.status(404)
     .render('errors/generic', {
        status: 404,
        content: "Not found"
    })
}

const o_serverError = (err, i, o, next) => {
    if (!err) {
        let err = {}
    }
    if (!err.status) {
        err.status = 500
    }
    if (!err.content) {
        err.content = "Something's broken on our end. Sorry about that."
    }

    console.log(err)

    o.status(err.status)
     .render('errors/generic', {
        status: err.status,
        content: err.content
    })
}

// 404
router.get('*', o_invalid)
router.post('*', o_invalid)

// 500/5xx
router.use(o_serverError)

module.exports = router
