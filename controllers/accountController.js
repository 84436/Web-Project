const express = require('express')
const router = express.Router()

const accountModel = require('../models/accountModel')
const authGuard = require('../helpers/authGuard')
const missingKeys = require('../helpers/missingKeys')

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

module.exports = router
