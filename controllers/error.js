const express = require('express')
const app = express()

const o_invalid = (i, o) => {
    o.status(404)
     .render('errors/404')
}

const o_serverError = (err, i, o, next) => {
    if (err) {
        console.log(err)
        o.status(500)
         .render('errors/500', err, {
            layout: false
        })
    }
}

// 404
app.get('*', o_invalid)

// 500/5xx
app.use(o_serverError)

module.exports = app
