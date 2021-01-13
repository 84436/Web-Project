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
    var x = await activityModel.setFeedback("5ffdc01aca2f15373471db53","5ffdc57666e87f7e7a55df39", 2, "This course's sucky sucky")
})
