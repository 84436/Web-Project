const express = require('express')
const express_handlebars = require('express-handlebars')
const path = require('path')

const authGuard = require('./authGuard')
const courseModel = require('../models/courseModel')

const router = express.Router()

module.exports = router
