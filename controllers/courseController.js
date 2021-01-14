const express = require('express')
const router = express.Router()

const courseModel = require('../models/courseModel')
const authGuard = require('../helpers/authGuard')

module.exports = router
