const express = require('express')
const app = express()

app.get('/', (i, o) => {
    let str = ""
    str += "Hello world.\n"
    str += `The time is ${Date().toString()}\n`
    str += `Here's the Mongoose connection thingy: ${global.mongoose.connection.host}, ${global.mongoose.connection.readyState}\n`
    o.send(str)
})

module.exports = app