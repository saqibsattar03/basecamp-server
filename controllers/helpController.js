import asyncHandler from 'express-async-handler'
import Help from '../models/helpModel.js'
import AppError from '../utilis/appError.js'

// ******** CREATE ********

// @desc    Create a new help
// @route   POST /api/help
// @access  Private
const createNewHelp = asyncHandler(async (req, res) => {
  const help = await Help.create(req.body)

  if (help) {
    res.status(201).json(help)
  } else {
    res.status(400)
    throw new Error('Invalid help data')
  }
})

// ******** READ ********

// @desc    Get all help
// @route   GET /api/help/:page
// @access  Private/Admin
const getAllHelp = asyncHandler(async (req, res) => {
  const resultsPerPage = 50
  const page = req.params.page || 0
  const helpCount = await Help.countDocuments({})

  const pagination = {
    totalCount: helpCount,
    currentPage: page
  }

  const help = await Help.find({})
    .sort({ createdAt: 'asc' })
    .limit(resultsPerPage)
    .skip(resultsPerPage > 0 ? resultsPerPage * (page - 1) : 0)

  res.status(200).json({ help, pagination })
})

// @desc    Get sorted help
// @route   GET /api/help/sorted/:filterKey/:direction/:numPerPage/:pageNum
// @access  Private/Admin
const getSortedHelp = asyncHandler(async (req, res) => {
  const pageNum = req.params.pageNum || 0
  const filterKey = req.params.filterKey || 'createdAt'
  const direction = req.params.direction || 'asc'
  const numPerPage = req.params.numPerPage || 25
  const helpCount = await Help.countDocuments({})

  const sortQuery = {}
  sortQuery[filterKey] = direction // ex { title: "asc" }

  const pagination = {
    totalCount: helpCount,
    currentPage: pageNum
  }

  const help = await Help.find({})
    .sort(filterKey)
    .limit(numPerPage)
    .skip(numPerPage > 0 ? numPerPage * (pageNum - 1) : 0)

  res.status(200).json({ help, pagination })
})

// @desc    Get help by ID
// @route   GET /api/help/:id
// @access  Private
const getHelpById = asyncHandler(async (req, res) => {
  const help = await Help.findById(req.params.id)

  res.status(200).json(help)
})

// ******** UPDATE ********

// @desc    Update help
// @route   PUT /api/help/:id
// @access  Private
const updateHelp = asyncHandler(async (req, res, next) => {
  const help = await Help.findByIdAndUpdate(req.params.id)

  // If we don't find the message, throw an error.
  if (!help) {
    return next(new AppError('No document found with that ID', 404))
  }

  res.status(200).json(help)
})

// ******** DELETE ********

// @desc    Delete help
// @route   DELETE /api/help/:id
// @access  Private
const deleteHelp = asyncHandler(async (req, res, next) => {
  const help = await Help.findByIdAndDelete(req.params.id)

  // If we don't find the message, throw an error.
  if (!help) {
    return next(new AppError('No document found with that ID', 404))
  }

  res.status(200).json(help)
})

export {
  createNewHelp,
  getHelpById,
  getAllHelp,
  getSortedHelp,
  updateHelp,
  deleteHelp
}
