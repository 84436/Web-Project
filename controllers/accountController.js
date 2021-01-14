const express = require('express')
const router = express.Router()

const accountModel = require('../models/accountModel')
const authGuard = require('../helpers/authGuard')
const missingKeys = require('../helpers/missingKeys')
const courseModel = require("../models/courseModel");
const activityModel = require("../models/activityModel")

// router.get('/login', authGuard(), async (i, o, next) => {
//     o.render('account/login')
// })

// router.post('/login', authGuard(), async (i, o, next) => {
//     let missingKeysError = missingKeys(i.body, ['email', 'password'])
//     if (missingKeysError) {
//         return next({
//             status: 401,
//             content: `Missing keys: ${missingKeysError._missing}`
//         })
//     }

//     let account = await accountModel.getByLogin(i.body.email, i.body.password)
//     o.send(account)
// })

router.get('/account/enrolled', async (i, o, next) => {
    let a = await activityModel.getAllEnrollList(i.session.User._id)
    console.log(a)
    o.render('account/myEnrolled')
})

module.exports = router
