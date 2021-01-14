const express = require('express')
const app = express()
const port = 3000

// Waiting for database
console.log("Waiting for database")
require('./config/mongodb')(app)

// Once ready, configure the rest and go
app.on('ready', async () => {

    // A small notification
    console.log(`Connected to ${global.mongoose.connection.host}:${global.mongoose.connection.port}`)
    
    const accountModel = require('./models/accountModel')
    const categoryModel = require('./models/categoryModel')
    const courseModel = require('./models/courseModel')
    const activityModel = require('./models/activityModel')
    // var x = await activityModel.enrollCourse("5fff19766399334438d75986", "5ffdd2e7ca2f15373471db5b")
    // console.log(x)
    x = await accountModel.getAllLecturer()
    console.log(x)
})
