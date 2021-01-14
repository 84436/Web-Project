const express = require('express')
const router = express.Router()

const o_invalid = (i, o, next) => {
    o.status(404)
     .render('errors/404')
}

const o_serverError = (err, i, o, next) => {
    o.status(500)
     .render('errors/500')
}

// 404
router.use('*', o_invalid)

// 500/5xx
router.use(o_serverError)

module.exports = router
