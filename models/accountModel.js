const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const { BCRYPT_WORK_FACTOR } = require('../config/bcrypt.json')

var accountSchema = new mongoose.Schema({
    email: String,
    name: String,

    password: {
        type: String,
        select: false // hide this field when finding accounts
    },
    type: {
        type: String,
        enum: ["student", "instructor", "admin"],
        default: "student"
    },

    isActive: Boolean,
    isLocked: Boolean,
    instructorBio: String
})

var accountModel = mongoose.model("account", accountSchema, "accounts")

/********************************************************************************/

async function checkID(id) {
    let r = { _error: null }

    try {
        let account = await accountModel.findById(id, (err) => {
            if (err) { r._error = err }
        })
        if (!account) {
            r._error = "No account found with given ID"
        }
    }
    catch (referenceExc) {
        r._error = "Invalid ID"
    }

    return r
}

async function checkEmail(email) {
    let r = { _error: null }

    let filter = {
        "email": email
    }
    let account = await accountModel.findOne(filter, (err) => {
        if (err) { r._error = err }
    })
    if (account) {
        r._error = "An account already exists with the given email"
    }

    return r
}

async function add(info, type, isActive, isLocked) {
    let r = { _error: null }

    r = { ...await checkEmail(info.email) }
    if (r._error) return r

    let new_account_info = {
        "email": info.email,
        "password": info.password,
        "name": info.name,
        "instructorBio": "",
        "type": type,
        "isActive": isActive,
        "isLocked": isLocked
    }

    console.log(new_account_info)

    let new_account = new accountModel(new_account_info)
    await new_account.save((err) => {
        if (err) { r._error = err; return r }
    })

    // WORKAROUND: GET INFO FROM THAT NEWLY CREATED ACCOUNT
    delete (new_account_info.password)
    // new_account_info.joinDate = new_account._doc.joinDate
    r = {
        ...r,
        "_id": new_account.id,
        ...new_account_info
    }
    return r
}

async function closeAccount(id) {
    let r = { _error: null }

    r = { ...await checkID(id) }
    if (r._error) return r

    let info = {
        "email": "",
        "password": ""
    }
    await accountModel.findByIdAndUpdate(id, info, (err) => {
        if (err) { r._error = err; return r }
    })

    return r
}

async function edit(id, new_info) {
    let r = { _error: null }

    r = { ...await checkID(id) }
    if (r._error) return r

    await accountModel.findByIdAndUpdate(id, new_info, (err) => {
        if (err) { r._error = err; return r }
    })

    return r
}

async function changePassword(id, oldpw, newpw) {
    let account = await accountModel.findById(id, { _id: 1, password: 1 })
    if (!account) {
        return false
    }
    var oldpwHash = account.password
    if (!bcrypt.compareSync(oldpw, oldpwHash)) {
        return false
    }

    let newpwHash = bcrypt.hashSync(newpw, BCRYPT_WORK_FACTOR)

    account.password = newpwHash
    account.save()
    return true
}

async function getAllStudent() {
    let filter = {
        "type": "student"
    }
    let projection = {
        __v: 0
    }
    return res = await accountModel.find(filter, projection, (err) => {
        return null;
    })
        .lean();
}

async function getAllLecturer() {
    let filter = {
        "type": "lecturer"
    }
    let projection = {
        __v: 0
    }
    return res = await accountModel.find(filter, projection, (err) => {
        return null;
    })
        .lean();
}

async function getByID(id) {
    let r = { _error: null }

    r = { ...await checkID(id) }
    if (r._error) return r

    let projection = {
        __v: 0
    }
    let account = await accountModel.findById(id, projection, (err) => {
        if (err) { r._error = err; return r }
    })

    r = { ...r, ...account._doc }
    return r
}

async function getByLogin(email, password) {
    let r = { _error: null }

    let filter = {
        email: email
    }
    let account = await accountModel.findOne(filter, { _id: 1, password: 1, name: 1, type: 1, isActive: 1, isLocked: 1 });
    if (!account) {
        r._error = "Account not exist"
        return r
    }
    else {
        if (bcrypt.compareSync(password, account.password)) {
            if (!account.isActive) {
                r._error = "Your account is not activated. Please check your email."
                return r
            }
            else if (account.isLocked) {
                r._error = "Your account is locked. Please contact our administrators."
                return r
            }
            else {
                r = { ...r, ...account._doc }
                return r
            }
        }
        else {
            r._error = "Wrong password"
            return r
        }
    }
}

async function registerAccount(newAccount) {
    let r = { _error: null }
    let type = "student"
    let isActive = false
    let isLocked = false
    newAccount.password = bcrypt.hashSync(newAccount.password, BCRYPT_WORK_FACTOR)
    r = { ...await add(newAccount, type, isActive, isLocked) }
    return r
}

async function setLockAccount(accountID, newState) {
    let filter = {
        _id: accountID
    }

    let projection = {
        __v: 0
    }

    let specificAccount = accountModel.findOne(filter, projection, (err) => {
        return null
    })
    if(specificAccount) {
        specificAccount.isLock = newState
        specificAccount.save()
    }
    return specificAccount
}


/********************************************************************************/

module.exports = {
    add: add,
    closeAccount: closeAccount,
    edit: edit,
    getByID: getByID,
    getByLogin: getByLogin,
    checkID: checkID,
    checkEmail: checkEmail,
    changePassword: changePassword,
    registerAccount: registerAccount,
    getAllStudent: getAllStudent,
    getAllLecturer: getAllLecturer,
    setLockAccount: setLockAccount
}
