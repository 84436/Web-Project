const express = require('express')
const express_handlebars = require('express-handlebars')
const path = require('path')

const authGuard = require('./authGuard')
const accountModel = require('../models/accountModel')
const missingKeys = require('./missingKeys')

const router = express.Router()

router.get('/login', authGuard(), async (i, o, next) => {
    o.render('account/login')
})

router.post('/login', authGuard(), async (i, o, next) => {
    let missingKeysError = missingKeys(i.body, ['email', 'password'])
    if (missingKeysError) {
        return next({
            status: 401,
            content: `Missing keys: ${missingKeysError._missing}`
        })
    }

    let account = await accountModel.getByLogin(i.body.email, i.body.password)
    o.send(account)
})

module.exports = router
