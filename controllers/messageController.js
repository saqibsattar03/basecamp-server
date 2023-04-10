import asyncHandler from 'express-async-handler'
import Message from '../models/messageModel.js'
import AppError from "../utilis/appError.js";

// ******** CREATE ********

// @desc    Create a new message
// @route   POST /api/messages
// @access  Private
const createNewMessage = asyncHandler(async (req, res) => {
  const message = await Message.create(req.body)

  if (message) {
    res.status(201).json(message)
  } else {
    res.status(400)
    throw new Error('Invalid message data')
  }
})

// ******** READ ********

// @desc    Get all messages
// @route   GET /api/messages/:page
// @access  Private/Admin
const getAllMessages = asyncHandler(async (req, res) => {
  const resultsPerPage = 50;
  const page = req.params.page || 0;
  const messageCount = await Message.countDocuments({})

  const pagination = {
    totalCount: messageCount,
    currentPage: page
  }

  const messages = await Message.find({})
      .sort({createdAt: "asc"})
      .limit(resultsPerPage)
      .skip(resultsPerPage > 0 ? resultsPerPage * (page - 1) : 0)

  res.status(200).json({messages, pagination});
})


// @desc    Get sorted messages
// @route   GET /api/messages/sorted/:filterKey/:direction/:numPerPage/:pageNum
// @access  Private/Admin
const getSortedMessages = asyncHandler(async (req, res) => {
  const pageNum = req.params.pageNum || 0;
  const filterKey = req.params.filterKey || "createdAt";
  const direction = req.params.direction || "asc";
  const numPerPage = req.params.numPerPage || 25;
  const messageCount = await Message.countDocuments({});

  let sortQuery = {}
  sortQuery[filterKey] = direction // ex { title: "asc" }

  const pagination = {
    totalCount: messageCount,
    currentPage: pageNum
  }

  const messages = await Message.find({})
      .sort(filterKey)
      .limit(numPerPage)
      .skip(numPerPage > 0 ? numPerPage * (pageNum - 1) : 0)

  res.status(200).json({messages, pagination});
})


// @desc    Get message by ID
// @route   GET /api/messages/:id
// @access  Private
const getMessageById = asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.id)

  res.status(200).json(message);
})

// ******** UPDATE ********

// @desc    Update message
// @route   PUT /api/messages/:id
// @access  Private
const updateMessage = asyncHandler(async (req, res, next) => {
  const message = await Message.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })

  // If we don't find the message, throw an error.
  if (!message) {
    return next(new AppError('No document found with that ID', 404));
  }

  res.status(200).json(message)
})

// ******** DELETE ********

// @desc    Delete message
// @route   DELETE /api/messages/:id
// @access  Private
const deleteMessage = asyncHandler(async (req, res) => {
  const message = await Message.findByIdAndDelete(req.params.id)

  if (!message) {
    return next(new AppError('No document found with that ID', 404));
  }

  res.status(200).json({message: 'Message removed'});
})


export {
  createNewMessage,
  getMessageById,
  getAllMessages,
  getSortedMessages,
  updateMessage,
  deleteMessage,
}