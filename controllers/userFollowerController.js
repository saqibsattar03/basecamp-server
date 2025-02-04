import asyncHandler from 'express-async-handler'
import UserFollower from '../models/userFollowerModel.js'
import AppError from "../utilis/appError.js";

// ******** CREATE ********

// @desc    Create a new UserFollower
// @route   POST /api/user-followers
// @access  Private
const createNewUserFollower = asyncHandler(async (req, res) => {
  const userFollower = await UserFollower.create(req.body)
  if (userFollower) {
    res.status(201).json(userFollower)
  } else {
    res.status(400)
    throw new Error('Invalid UserFollower data')
  }
})

// ******** READ ********

// @desc    Get all UserFollowers
// @route   GET /api/user-followers/:page
// @access  Private/Admin
const getAllUserFollowers = asyncHandler(async (req, res) => {
  const resultsPerPage = 50;
  const page = req.params.page || 0;
  const userFollowerCount = await UserFollower.countDocuments({})

  const pagination = {
    totalCount: userFollowerCount,
    currentPage: page
  }

  const userFollowers = await UserFollower.find({})
      .sort({createdAt: "asc"})
      .limit(resultsPerPage)
      .skip(resultsPerPage > 0 ? resultsPerPage * (page - 1) : 0)

  res.status(200).json({userFollowers, pagination});
})


// @desc    Get sorted UserFollowers
// @route   GET /api/user-followers/sorted/:filterKey/:direction/:numPerPage/:pageNum
// @access  Private/Admin
const getSortedUserFollowers = asyncHandler(async (req, res) => {
  const pageNum = req.params.pageNum || 0;
  const filterKey = req.params.filterKey || "createdAt";
  const direction = req.params.direction || "asc";
  const numPerPage = req.params.numPerPage || 25;
  const userFollowerCount = await UserFollower.countDocuments({});

  let sortQuery = {}
  sortQuery[filterKey] = direction // ex { title: "asc" }

  const pagination = {
    totalCount: userFollowerCount,
    currentPage: pageNum
  }

  const userFollowers = await UserFollower.find({})
      .sort(filterKey)
      .limit(numPerPage)
      .skip(numPerPage > 0 ? numPerPage * (pageNum - 1) : 0)

  res.status(200).json({userFollowers, pagination});
})


// @desc    Get UserFollower by ID
// @route   GET /api/user-followers/:id
// @access  Private
const getUserFollowerById = asyncHandler(async (req, res) => {
  const userFollower = await UserFollower.findById(req.params.id)

  res.status(200).json(userFollower)
})

// ******** UPDATE ********

// @desc    Update UserFollower
// @route   PUT /api/user-followers/:id
// @access  Private
const updateUserFollower = asyncHandler(async (req, res, next) => {
  const userFollower = await UserFollower.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })
  // If we don't find the user, throw an error.
  if (!userFollower) {
    return next(new AppError('No document found with that ID', 404));
  }

  res.status(200).json(userFollower)
})

// ******** DELETE ********

// @desc    Delete UserFollower
// @route   DELETE /api/user-followers/:id
// @access  Private
const deleteUserFollower = asyncHandler(async (req, res, next) => {
  const userFollower = await UserFollower.findByIdAndDelete(req.params.id)

  if (!userFollower) {
    return next(new AppError('No document found with that ID', 404));
  }

  res.status(200).json({message: 'UserFollower removed'});
})


export {
  createNewUserFollower,
  getUserFollowerById,
  getAllUserFollowers,
  getSortedUserFollowers,
  updateUserFollower,
  deleteUserFollower,
}