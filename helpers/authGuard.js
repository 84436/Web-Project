const express = require('express')
const app = express()

const accountModel = require('../models/accountModel')

// https://stackoverflow.com/a/12737295

// Hard-coded permission list
const PERMISSION_LIST = {
    guest: [
        
    ],
    student: [
        
    ],
    instructor: [
        
    ],
    admin: [
        
    ]
}

function middleware(action) {
    return function(err, i, o, next) {
        if (err) {
            return next(err)
        }

        // Get role from user ID in cookie
        let role = "guest"
        if (i.session.userID) {
            let user = accountModel.getByID(i.session.userID)
            if (user) {
                role = user.type
            }
        }
        
        // Check for action
        let available_actions = PERMISSION_LIST[role] || []
        if (!available_actions.includes(action)) {
            next({
                status: 403,
                content: "Forbidden."
            })
        }
        else {
            next()
        }
    }
}

module.exports = middleware
