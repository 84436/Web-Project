const express = require('express')
const router = express.Router()

const jwt = require("jsonwebtoken")
const emailService = require("../helpers/emailService")

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

    let user = {
        _id: auth._id,
        email: auth.email,
        name: auth.name,
        type: auth.type
    }

    if (!auth._error) {
        const token = jwt.sign(user, "$2y$12$ZyMxyuXzyIEu379tFuWMwONEi/4qDguN1pmVALXfH8oWHKVGS9cli", {
            expiresIn: '10m'
        });

        emailService.sendConfirmationEmail(i.body, token, (error, data) => {
            let err = null;
            if (error) {
                return o.json("Failed to send mail verification: " + error);
            }
            return o.json("Email sent. Please check your email");
        })
    } else {
        o.json(auth._error)
    }
})

router.get("/confirmation/:token", async (i, o, next) => {
    let user = jwt.verify(i.params.token, "$2y$12$ZyMxyuXzyIEu379tFuWMwONEi/4qDguN1pmVALXfH8oWHKVGS9cli")
    if (!user) {
        o.render(new Error())
    } else {
        accountModel.edit(user._id, { isActive: true });
        o.redirect("/login")
    }
})

router.get('/logout', async (i, o, next) => {
    i.session.destroy()
    o.redirect("/")
})

module.exports = router
