const express = require('express')
const router = express.Router()

const authGuard = require('../helpers/authGuard')
const courseModel = require('../models/courseModel')

module.exports = router
