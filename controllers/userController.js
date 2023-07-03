import asyncHandler from 'express-async-handler'
import User from '../models/userModel.js'
import AppError from '../utilis/appError.js'
import jwt from 'jsonwebtoken'
import bcrypt from "bcrypt";

// ******** Login ********

// @desc    user login
// @route   POST /users/login
// @access  Public

const login = asyncHandler(async (req, res, next) => {
  console.log('Logging in')

  try {
    let { email, password } = req.body
    console.log(req.body);
    if (!email || !password) {
      return next(new AppError('Invalid credentials', 401))
    }

    email = email.toString().toLowerCase()
    console.log('email', email)

    const user = await User.findOne({
      $or: [{ email }, { username: email }]
    })

    console.log(user)

    if (!user) res.status(400).json({ "error": "User not found." })

    console.log('got user')

    const id = user?._id

    console.log('trying to match pass')
    const passwordMatch = await user.matchPassword(password)

    if (passwordMatch && user) {
      console.log('pass matched')
      const token = jwt.sign({ email, id }, process.env.JWT_SECRET)
      console.log('got token')
      res.status(200).json({ user, token })
    } else {
      console.log('failed checks throwing error...')
      return next(new AppError('Invalid credentials', 401))
    }
  } catch (e) {
    next(e)
  }
})

// ******** CREATE ********

// @desc    Create a new user
// @route   POST /api/users
// @access  Private
const createNewUser = asyncHandler(async (req, res, next) => {
  console.log("user data :: ", req.body)
  let { username, email, password } = req.body
  username = username.toString().toLowerCase()
  email = email.toString().toLowerCase()
  if (await User.findOne({ $or: [{ username }, { email }] })) {
    return next(
      new AppError('User with this email/username already exists!', 409)
    )
  }

  const user = await User.create(req.body)

  if (user) {
    res.status(201).json({ user })
  } else {
    res.status(400)
    throw new Error('Invalid user data')
  }
})

// ******** READ ********

// @desc    Get all users
// @route   GET /api/users/:page
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
  const resultsPerPage = 50
  const page = req.params.page || 0
  const userCount = await User.countDocuments({})

  const pagination = {
    totalCount: userCount,
    currentPage: page
  }

  const users = await User.find({})
    .sort({ createdAt: 'asc' })
    .limit(resultsPerPage)
    .skip(resultsPerPage > 0 ? resultsPerPage * (page - 1) : 0)

  res.status(200).json({ users, pagination })
})

// @desc    Get sorted users
// @route   GET /api/users/sorted/:filterKey/:direction/:numPerPage/:pageNum
// @access  Private/Admin
const getSortedUsers = asyncHandler(async (req, res) => {
  const pageNum = req.params.pageNum || 0
  const filterKey = req.params.filterKey || 'createdAt'
  const direction = req.params.direction || 'asc'
  const numPerPage = req.params.numPerPage || 25
  const userCount = await User.countDocuments({})

  const sortQuery = {}
  sortQuery[filterKey] = direction // ex { title: "asc" }

  const pagination = {
    totalCount: userCount,
    currentPage: pageNum
  }

  const users = await User.find({})
    .sort(filterKey)
    .limit(numPerPage)
    .skip(numPerPage > 0 ? numPerPage * (pageNum - 1) : 0)

  res.status(200).json({ users, pagination })
})

// @desc    Get user by ID
// @route   GET /api/users/get_user/:id
// @access  Private
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)

  res.status(200).json(user)
})

// ******** UPDATE ********

// @desc    Update user
// @route   PATCH /users/:id
// @access  Private
const updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })
  // If we don't find the user, throw an error.
  if (!user) {
    return next(new AppError('No document found with that ID', 404))
  }

  res.status(200).json(user)
})

// ******** DELETE ********

// @desc    Delete user
// @route   DELETE /users/:id
// @access  Private
const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id)

  if (!user) {
    return next(new AppError('No document found with that ID', 404))
  }

  res.status(200).json({ message: 'User removed' })
})


// ******** Change Password ********

// @desc    Change user password
// @route   POST /users/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res, next)=>{
  const { email, oldPassword, newPassword } = req.body

  const user = await User.findOne({email:email}).select('password')

  if(!user)
    return next(new AppError('no user found with given email', 404))

  // checking if the given password is correct
  const passwordMatch = await user.matchPassword(oldPassword)

  if(!passwordMatch)
    return next(new AppError('old password is incorrect.', 404))

  // creating hash of given newPassword
  const hashedPassword = await bcrypt.hash(newPassword,10)

  // comparing the old and new password
  if(await bcrypt.compare(oldPassword,hashedPassword))
    return next(new AppError('old password and new password can not be same.', 404))
  else
    await User.updateOne(
        { email: email },
        { password: hashedPassword }
    )
  res.status(200).json("password changed successfully")
})

export {
  createNewUser,
  getUserById,
  getAllUsers,
  getSortedUsers,
  updateUser,
  deleteUser,
  login,
  changePassword
}
