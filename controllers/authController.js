const express = require('express')
const router = express.Router()

const accountModel = require("../models/accountModel")
const categoryModel = require('../models/categoryModel')

router.use(function (i, o, next) {
    if (i.session.User && i.originalUrl !== "/logout") {
        o.redirect("/")
    }
    else {
        next()
    }
})

router.get('/login', async (i, o, next) => {
    o.locals.catList = await categoryModel.getAll()
    console.log(o.locals.catList)
    o.render('account/login')
})

router.post('/login', async (i, o, next) => {
    let email = i.body.email
    let password = i.body.password

    // Cookie
    let auth = await accountModel.getByLogin(email, password);

    if (!auth._error) {
        let account = {
            _id: auth._id,
            name: auth.name,
            type: auth.type
        }

        i.session.User = account;

        o.json(null)
    }
    else {
        o.json(auth._error)
    }
})

router.get('/register', async (i, o, next) => {
    o.locals.catList = await categoryModel.getAll()
    o.render('account/register')
})

router.post('/register', async (i, o, next) => {
    let email = i.body.email;
    let password = i.body.password;
    let name = i.body.name;

    let auth = await accountModel.registerAccount({
        email: email,
        password: password,
        name: name
    });

    if (!auth._error) {
        let account = {
            _id: auth._id,
            name: auth.name,
            type: auth.type
        };

        i.session.User = account;

        o.json(null)
    } else {
        o.json(auth._error)
    }
})

router.get('/logout', async (i, o, next) => {
    i.session.destroy()
    o.redirect("/")
})


module.exports = router
